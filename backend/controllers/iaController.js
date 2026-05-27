import { pool } from "../database/database.js";

export const procesarMensaje = async (req, res) => {
  try {
    const { mensaje, historial = [] } = req.body;
    const usuario_id = req.user.id;

    // 1. RELOJ INTERNO (Ajustamos la hora local para Argentina/UNRaf)
    const hoy = new Date();
    hoy.setHours(hoy.getHours() - 3); 
    const fechaActual = hoy.toISOString().split('T')[0]; 
    const horaActual = hoy.toISOString().split('T')[1].substring(0, 8);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    const fechaManana = manana.toISOString().split('T')[0];

    // Obtenemos las aulas reales de la base de datos
    const [aulas] = await pool.query("SELECT id, nombre FROM aulas");
    const listaAulas = aulas.map(a => `${a.nombre} (ID: ${a.id})`).join(", ");

    // 2. AGENDA GLOBAL (Para saber qué está ocupado y qué no)
    const [reservas] = await pool.query(`
      SELECT a.nombre as aula, DATE_FORMAT(r.fecha, '%Y-%m-%d') as fecha, 
      TIME_FORMAT(r.hora_inicio, '%H:%i') as hora_inicio, 
      TIME_FORMAT(r.hora_fin, '%H:%i') as hora_fin 
      FROM reservas r 
      JOIN aulas a ON r.aula_id = a.id 
      WHERE r.fecha >= CURDATE()
    `);
    
    const agendaOcupada = reservas.length > 0 
      ? reservas.map(r => {
          let etiqueta = r.fecha;
          if (r.fecha === fechaActual) etiqueta = "¡HOY!";
          else if (r.fecha === fechaManana) etiqueta = "¡MAÑANA!";
          return `- AULA: ${r.aula} | DIA: ${etiqueta} | HORARIO: ${r.hora_inicio} a ${r.hora_fin}`;
        }).join("\n") 
      : "La agenda está vacía.";

    // 3. AGENDA PERSONAL (Las reservas del usuario logueado)
    const [misReservasDB] = await pool.query(`
      SELECT r.id, a.nombre as aula, DATE_FORMAT(r.fecha, '%Y-%m-%d') as fecha, 
      TIME_FORMAT(r.hora_inicio, '%H:%i') as hora_inicio, 
      TIME_FORMAT(r.hora_fin, '%H:%i') as hora_fin 
      FROM reservas r 
      JOIN aulas a ON r.aula_id = a.id 
      WHERE r.usuario_id = ? AND r.fecha >= CURDATE()
    `, [usuario_id]);
    
    const misReservasTexto = misReservasDB.length > 0 
      ? misReservasDB.map(r => `- ID: ${r.id} | ${r.aula} el ${r.fecha === fechaActual ? "¡HOY!" : r.fecha} a las ${r.hora_inicio}`).join("\n") 
      : "No tienes reservas.";

    // 4. EL PROMPT BLINDADO PARA LA IA
    const prompt = `
    Eres UniBot, el asistente virtual oficial del Sistema de Gestión de Aulas de la UNRaf.
    Hoy es ${fechaActual}, ${horaActual}. 
    
    AULAS DISPONIBLES EN EL SISTEMA: ${listaAulas}.
    
    AGENDA GLOBAL DE OCUPACIÓN REAL: 
    ${agendaOcupada}

    MIS RESERVAS PERSONALES: 
    ${misReservasTexto}

    Debes responder ÚNICAMENTE con una estructura JSON que tenga este formato exacto:
    {
      "respuesta_texto": "Tu respuesta corta de menos de 15 palabras aquí",
      "accion": "reservar", "cancelar", o "consultar",
      "datos_reserva": { "aula_id": numero o null, "fecha": "YYYY-MM-DD" o null, "hora_inicio": "HH:MM:00" o null, "hora_fin": "HH:MM:00" o null },
      "reserva_id_a_cancelar": numero o null
    }

    REGLAS DE ORO:
    1. Si el usuario te saluda, di exactamente: "Hola, soy UniBot. ¿En qué puedo ayudarte con la gestión de aulas hoy?".
    2. Si te preguntan disponibilidad de un aula, comprueba si aparece reservada en ese horario. Si NO está, responde que está libre.
    3. Si el mensaje es incomprensible o tiene letras sueltas (por fallos del micrófono), responde: "Disculpa, no logré comprenderte. ¿Podrías repetir tu consulta?".
    4. Tus respuestas deben ser sumamente cortas (máximo 15 palabras) para poder ser leídas fluidamente por un lector de voz.
    `;

    const mensajesHistorial = historial.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    }));

    // Llamada a la API de Groq
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: prompt }, ...mensajesHistorial, { role: "user", content: mensaje }],
        response_format: { type: "json_object" },
        temperature: 0.0 // Cero para máxima precisión matemática
      })
    });

    const groqData = await groqResponse.json();
    
    // ==========================================
    // 🧽 FILTRO DE LIMPIEZA DE LA RESPUESTA IA
    // ==========================================
    let iaResponse;
    try {
      let rawContent = groqData.choices[0].message.content.trim();
      
      // Si la IA envolvió el JSON en bloques de código de markdown (```json ... ```), los eliminamos
      if (rawContent.startsWith("```json")) {
        rawContent = rawContent.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (rawContent.startsWith("```")) {
        rawContent = rawContent.replace(/^```/, "").replace(/```$/, "").trim();
      }
      
      // Buscamos dónde empieza realmente la llave '{' y dónde termina '}' por si la IA metió texto antes o después
      const inicioLlave = rawContent.indexOf('{');
      const finLlave = rawContent.lastIndexOf('}');
      if (inicioLlave !== -1 && finLlave !== -1) {
          rawContent = rawContent.substring(inicioLlave, finLlave + 1);
      }

      // Intentamos convertir la cadena limpia a un objeto de JavaScript
      iaResponse = JSON.parse(rawContent);

    } catch (parseError) {
      // Si todo falla, imprimimos en consola para que lo veas pero el servidor no se cae
      console.error("Error al procesar el JSON de la IA. Texto recibido:", groqData.choices[0].message.content);
      return res.json({ respuesta: "Ocurrió un error procesando la información. Por favor, intenta de nuevo." });
    }

    // 5. EJECUCIÓN EN BASE DE DATOS
    if (iaResponse.accion === "reservar") {
       const { aula_id, fecha, hora_inicio, hora_fin } = iaResponse.datos_reserva;
       if (!aula_id || !fecha || !hora_inicio) {
         return res.json({ respuesta: "Faltan datos para la reserva. " + iaResponse.respuesta_texto });
       }

       // Validamos que no se solape con otra reserva existente
       const [ocupadas] = await pool.query(
        `SELECT * FROM reservas WHERE aula_id = ? AND fecha = ? AND ((hora_inicio < ? AND hora_fin > ?) OR (hora_inicio < ? AND hora_fin > ?))`,
        [aula_id, fecha, hora_fin, hora_inicio, hora_fin, hora_inicio]
       );
       
       if (ocupadas.length > 0) {
         return res.json({ respuesta: `Lo siento, esa aula se ocupó hace un instante.` });
       }

       // Insertamos la reserva
       await pool.query("INSERT INTO reservas (aula_id, usuario_id, fecha, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?)", [
         aula_id, 
         usuario_id, 
         fecha, 
         hora_inicio, 
         hora_fin || '23:59:00'
       ]);
       
       return res.json({ respuesta: `¡Éxito! Reserva confirmada. ${iaResponse.respuesta_texto}` });

    } else if (iaResponse.accion === "cancelar") {
       if (!iaResponse.reserva_id_a_cancelar) {
         return res.json({ respuesta: iaResponse.respuesta_texto });
       }
       
       const [deleteResult] = await pool.query("DELETE FROM reservas WHERE id = ? AND usuario_id = ?", [
         iaResponse.reserva_id_a_cancelar, 
         usuario_id
       ]);
       
       return res.json({ 
         respuesta: deleteResult.affectedRows > 0 
           ? `¡Éxito! Reserva cancelada. ${iaResponse.respuesta_texto}` 
           : "No pude cancelar esa reserva." 
       });

    } else {
       // Si es una simple consulta de disponibilidad
       return res.json({ respuesta: iaResponse.respuesta_texto });
    }
  } catch (error) {
    console.error("Error general en la IA:", error);
    res.status(500).json({ respuesta: "Error interno en el servidor de chat." });
  }
};