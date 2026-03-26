import { pool } from "../database/database.js";

export const getReservas = async (usuario_id) => {
  const [rows] = await pool.query(
    `
    SELECT r.*, a.nombre AS aula_nombre
    FROM reservas r
    JOIN aulas a ON r.aula_id = a.id
    WHERE r.usuario_id = ?
    ORDER BY r.fecha DESC, r.hora_inicio ASC
    `,
    [usuario_id]
  );

  return rows;
};