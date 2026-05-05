import express from "express";
import { procesarMensaje } from "../controllers/iaController.js";

// 🔥 Sin las llaves { } porque es un "export default"
import verifyToken from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.post("/chat", verifyToken, procesarMensaje);

export default router;