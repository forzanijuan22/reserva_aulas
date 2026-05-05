import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import iaRoutes from "./routes/iaRoutes.js";
import authRoutes from "./routes/auth.js";
import aulasRoutes from "./routes/aulas.js";
import reservasRoutes from "./routes/reservas.js";

dotenv.config();

const app = express();

// 🔥 MODO PUERTAS ABIERTAS (Ideal para desarrollo local)
app.use(cors()); 

app.use(express.json());
app.use("/api/ia", iaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/aulas", aulasRoutes);
app.use("/api/reservas", reservasRoutes);

app.listen(process.env.PORT || 4000, "0.0.0.0", () => {
  console.log("Servidor corriendo en puerto 4000");
});