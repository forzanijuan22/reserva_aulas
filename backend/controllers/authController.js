import { pool } from "../database/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

/* ===========================
   REGISTER
=========================== */
export const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const [exists] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (exists.length > 0) {
      return res.status(400).json({ message: "Ese correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashedPassword]
    );

    res.json({ message: "Usuario creado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el registro" });
  }
};

/* ===========================
   LOGIN
=========================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol || "docente",
      },
      "secreto123",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol || "docente",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el login" });
  }
};

/* ===========================
   FORGOT PASSWORD
=========================== */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No existe una cuenta con ese correo" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await pool.query(
      `
      UPDATE usuarios
      SET reset_token = ?, reset_token_expiration = ?
      WHERE email = ?
      `,
      [token, expiration, email]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // CORRECCIÓN: Usar la variable de entorno para el dominio del frontend
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"Reserva de Aulas UNRaf" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Recuperación de contraseña</h2>
          <p>Hacé clic en el siguiente enlace para cambiar tu contraseña:</p>
          <p>
            <a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#1E3A5F;color:#fff;text-decoration:none;border-radius:8px;">
              Cambiar contraseña
            </a>
          </p>
          <p>O copiá y pegá este enlace en tu navegador:</p>
          <p>${resetLink}</p>
          <p>Este enlace vence en 1 hora.</p>
        </div>
      `,
    });

    res.json({ message: "Se envió el enlace a tu correo" });
  } catch (error) {
    console.error("ERROR forgotPassword:", error);
    res.status(500).json({ message: "Error al enviar el correo" });
  }
};

/* ===========================
   RESET PASSWORD
=========================== */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const [rows] = await pool.query(
      `
      SELECT * FROM usuarios
      WHERE reset_token = ?
      AND reset_token_expiration > NOW()
      `,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "El enlace es inválido o venció" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `
      UPDATE usuarios
      SET password = ?, reset_token = NULL, reset_token_expiration = NULL
      WHERE id = ?
      `,
      [hashedPassword, rows[0].id]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cambiar la contraseña" });
  }
};