import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import aulasRoutes from "./routes/aulas.js";
import reservasRoutes from "./routes/reservas.js";

dotenv.config();

const app = express();

// CORRECCIÓN: Configuración de CORS para aceptar peticiones de red local o localhost
const origenesPermitidos = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origenesPermitidos.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/aulas", aulasRoutes);
app.use("/api/reservas", reservasRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log("Servidor corriendo en puerto 4000");
});