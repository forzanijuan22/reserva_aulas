import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  crearReserva,
  listarHorariosOcupados,
  listarMisReservas,
  eliminarReserva,
} from "../controllers/reservasController.js";

const router = express.Router();

router.get("/ocupadas", verifyToken, listarHorariosOcupados);
router.get("/mis-reservas", verifyToken, listarMisReservas);
router.post("/", verifyToken, crearReserva);
router.delete("/:id", verifyToken, eliminarReserva);

export default router;