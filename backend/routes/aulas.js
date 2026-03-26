import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { getAulas } from "../controllers/aulasController.js";

const router = express.Router();

router.get("/", verifyToken, getAulas);

export default router;