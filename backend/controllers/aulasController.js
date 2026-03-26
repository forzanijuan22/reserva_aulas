import {pool} from "../database/database.js";

export const getAulas = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM aulas");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener aulas" });
  }
};