import axios from "axios";

// CORRECCIÓN: Usar variable de entorno de Vite o localhost:4000 como respaldo
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api"
});

export default api;