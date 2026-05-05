import { pool } from "../database/database.js";

export const procesarMensaje = async (req, res) => {
  try {
    const { mensaje, historial = [] } = req.body;
    const usuario_id = req.user.id;

    // 1. RELOJ INTERNO
    const hoy = new Date();
    hoy.setHours(hoy.getHours() - 3); 
    const fechaActual = hoy.toISOString().split('T')[0]; 
    const horaActual = hoy.toISOString().split('T')[1].substring(0, 8);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    const fechaManana = manana.toISOString().split('T')[0];

    const [aulas] = await pool.query("SELECT id, nombre FROM aulas");
    const listaAulas = aulas.map(a => `${a.nombre} (ID: ${a.id})`).join(", ");

    // 2. AGENDA GLOBAL (Con etiquetas estrictas)
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

    // 3. AGENDA PERSONAL
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

    // 4. 🔥 EL PROMPT BLINDADO (IDENTIDAD + REGLAS QUIRÚRGICAS)
    const prompt = `
    Eres UniBot, el asistente virtual oficial y profesional del Sistema de Gestión de Aulas de la UNRaf.
    Hoy es ${fechaActual}, ${horaActual}. 
    
    AULAS DISPONIBLES EN EL SISTEMA: ${listaAulas}.
    
    AGENDA GLOBAL DE OCUPACIÓN REAL: 
    ${agendaOcupada}

    MIS RESERVAS PERSONALES: 
    ${misReservasTexto}

    Responde SIEMPRE con este formato JSON estricto:
    {
      "respuesta_texto": "Tu respuesta",
      "accion": "reservar", "cancelar", o "consultar",
      "datos_reserva": { "aula_id": numero o null, "fecha": "YYYY-MM-DD" o null, "hora_inicio": "HH:MM:00" o null, "hora_fin": "HH:MM:00" o null },
      "reserva_id_a_cancelar": numero o null
    }

    PROTOCOLO DE VERIFICACIÓN Y COMPORTAMIENTO (PASO A PASO):
    1. IDENTIDAD INSTITUCIONAL: Tu "respuesta_texto" debe ser muy formal, cortés y directa (máximo 20 palabras para facilitar la lectura por voz). No uses introducciones redundantes.
    2. MANEJO DE AUDIO INCOHERENTE: Si el mensaje del usuario no tiene sentido, está mal escrito o son letras sueltas (ej: "asd", "ehhh"), ASUME QUE ES UN ERROR DEL MICRÓFONO. La acción será "consultar" y tu respuesta: "Disculpa, el micrófono no te captó bien. ¿Podrías repetirlo?".
    3. FUERA DE TEMA: Si preguntan temas no académicos (clima, fútbol, etc.), responde: "Como asistente de la UNRaf, solo puedo ayudarte con la gestión de espacios físicos."
    4. IDENTIFICAR AULA: Si preguntan por un aula, busca ÚNICAMENTE en la AGENDA GLOBAL. 
    5. FILTRADO ESTRICTO: Si el aula solicitada NO aparece en la lista de ocupación para la fecha, entonces está LIBRE. Responde: "El [Aula] está libre en ese horario. ¿Deseas reservarla?".
    6. PROHIBICIÓN DE CRUCE: Tienes PROHIBIDO usar información de otras aulas para responder sobre el aula solicitada.
    7. ACCIÓN "reservar": Úsala solo si el usuario ORDENA reservar (ej: "reservame", "anotame"). En "respuesta_texto" confirma (Ej: "Reserva confirmada para las 18:00"). ¡PROHIBIDO hacer preguntas después de confirmar!
    8. HORARIOS: Usa formato 24hs sin segundos.
    `;

    const mensajesHistorial = historial.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    }));

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: prompt }, ...mensajesHistorial, { role: "user", content: mensaje }],
        response_format: { type: "json_object" },
        temperature: 0.0 // 🔥 Mantenemos a CERO para máxima precisión matemática
      })
    });

    const groqData = await groqResponse.json();
    
    // Validación de seguridad para el parseo del JSON
    let iaResponse;
    try {
      iaResponse = JSON.parse(groqData.choices[0].message.content);
    } catch (parseError) {
      console.error("Error parseando JSON de Groq:", parseError);
      return res.json({ respuesta: "Ocurrió un error procesando la información. Por favor, intenta de nuevo." });
    }

    // 5. EJECUCIÓN EN BD
    if (iaResponse.accion === "reservar") {
       const { aula_id, fecha, hora_inicio, hora_fin } = iaResponse.datos_reserva;
       if (!aula_id || !fecha || !hora_inicio) return res.json({ respuesta: "Faltan datos para realizar la reserva. " + iaResponse.respuesta_texto });

       const [ocupadas] = await pool.query(
        `SELECT * FROM reservas WHERE aula_id = ? AND fecha = ? AND ((hora_inicio < ? AND hora_fin > ?) OR (hora_inicio < ? AND hora_fin > ?))`,
        [aula_id, fecha, hora_fin, hora_inicio, hora_fin, hora_inicio]
       );
       if (ocupadas.length > 0) return res.json({ respuesta: `Lo siento, el espacio acaba de ser reservado por otro usuario.` });

       await pool.query("INSERT INTO reservas (aula_id, usuario_id, fecha, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?)", [aula_id, usuario_id, fecha, hora_inicio, hora_fin || '23:59:00']);
       return res.json({ respuesta: `¡Éxito! ${iaResponse.respuesta_texto}`, reservaRealizada: true });

    } else if (iaResponse.accion === "cancelar") {
       if (!iaResponse.reserva_id_a_cancelar) return res.json({ respuesta: iaResponse.respuesta_texto });
       const [deleteResult] = await pool.query("DELETE FROM reservas WHERE id = ? AND usuario_id = ?", [iaResponse.reserva_id_a_cancelar, usuario_id]);
       return res.json({ respuesta: deleteResult.affectedRows > 0 ? `¡Éxito! ${iaResponse.respuesta_texto}` : "No pude localizar esa reserva en tu agenda." });

    } else {
       return res.json({ respuesta: iaResponse.respuesta_texto });
    }
  } catch (error) {
    console.error("Error IA:", error);
    res.status(500).json({ respuesta: "Error de conexión con el servidor." });
  }
};