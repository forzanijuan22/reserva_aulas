import { pool } from "../database/database.js";

/* ===========================
   CREAR RESERVA
=========================== */
export const crearReserva = async (req, res) => {
  const { aula_id, fecha, hora_inicio, hora_fin } = req.body;
  const usuario_id = req.user.id;

  if (!aula_id || !fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  if (hora_inicio >= hora_fin) {
    return res.status(400).json({ message: "Horario inválido" });
  }

  try {
    const [conflicto] = await pool.query(
      `
      SELECT * FROM reservas
      WHERE aula_id = ?
      AND fecha = ?
      AND (
        hora_inicio < ? AND hora_fin > ?
      )
      `,
      [aula_id, fecha, hora_fin, hora_inicio]
    );

    if (conflicto.length > 0) {
      return res.status(400).json({
        message: "Ya existe una reserva en ese día y horario",
      });
    }

    await pool.query(
      `
      INSERT INTO reservas (aula_id, usuario_id, fecha, hora_inicio, hora_fin)
      VALUES (?, ?, ?, ?, ?)
      `,
      [aula_id, usuario_id, fecha, hora_inicio, hora_fin]
    );

    res.json({ message: "Reserva creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creando reserva" });
  }
};

/* ===========================
   HORARIOS OCUPADOS (TODOS)
=========================== */
export const listarHorariosOcupados = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        r.id,
        r.aula_id,
        r.usuario_id,
        r.fecha,
        r.hora_inicio,
        r.hora_fin,
        a.nombre AS aula_nombre,
        u.nombre AS usuario_nombre
      FROM reservas r
      JOIN aulas a ON r.aula_id = a.id
      JOIN usuarios u ON r.usuario_id = u.id
      ORDER BY r.fecha ASC, r.hora_inicio ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo horarios ocupados" });
  }
};

/* ===========================
   MIS RESERVAS (SOLO MÍAS)
=========================== */
export const listarMisReservas = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        r.id,
        r.aula_id,
        r.usuario_id,
        r.fecha,
        r.hora_inicio,
        r.hora_fin,
        a.nombre AS aula_nombre
      FROM reservas r
      JOIN aulas a ON r.aula_id = a.id
      WHERE r.usuario_id = ?
      ORDER BY r.fecha ASC, r.hora_inicio ASC
      `,
      [usuario_id]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo tus reservas" });
  }
};

/* ===========================
   ELIMINAR RESERVA (SOLO MÍA)
=========================== */
export const eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;

    const [reserva] = await pool.query(
      "SELECT * FROM reservas WHERE id = ?",
      [id]
    );

    if (reserva.length === 0) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (reserva[0].usuario_id !== usuario_id) {
      return res.status(403).json({
        message: "No podés cancelar una reserva de otra cuenta",
      });
    }

    await pool.query("DELETE FROM reservas WHERE id = ?", [id]);

    res.json({ message: "Reserva cancelada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error cancelando reserva" });
  }
};