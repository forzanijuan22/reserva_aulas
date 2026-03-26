import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, "secreto123"); // ⚠ MISMO SECRETO
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error token:", error);
    return res.status(403).json({ message: "No autorizado" });
  }
}