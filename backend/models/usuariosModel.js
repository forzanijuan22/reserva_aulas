import { pool } from "../database/database.js";

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email]
  );
  return rows[0];
};

export const createUser = async (nombre, email, passwordHash) => {
  await pool.query(
    "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
    [nombre, email, passwordHash]
  );
};