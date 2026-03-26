import { pool } from "../database/database.js";

export const getAllAulas = async () => {
  const [rows] = await pool.query("SELECT * FROM aulas");
  return rows;
};