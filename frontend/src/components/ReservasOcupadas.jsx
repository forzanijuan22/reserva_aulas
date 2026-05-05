import { useEffect, useState } from "react";

export default function ReservasOcupadas() {
  const [reservas, setReservas] = useState([]);

  // 🔥 MAGIA: IP DINÁMICA
  const API_URL = `http://${window.location.hostname}:4000/api`;

  const fetchReservasOcupadas = async () => {
    try {
      const token = localStorage.getItem("token");

      // 🔄 Reemplazamos localhost por API_URL
      const res = await fetch(`${API_URL}/reservas/ocupadas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setReservas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setReservas([]);
    }
  };

  useEffect(() => {
    fetchReservasOcupadas();

    const interval = setInterval(fetchReservasOcupadas, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
      {reservas.length === 0 ? (
        <p className="text-gray-400">No hay reservas</p>
      ) : (
        reservas.map((r) => (
          <div
            key={r.id}
            className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-lg text-sm font-medium shadow-sm"
          >
            <p className="font-bold text-base mb-1">{r.aula_nombre}</p>
            {/* 📅 Fecha más legible */}
            <p className="text-xs opacity-80 mb-1">
              {new Date(r.fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
            {/* ⏰ Horas sin los segundos */}
            <p className="text-xs bg-red-200 dark:bg-red-800/50 inline-block px-2 py-1 rounded">
              {r.hora_inicio.substring(0, 5)} - {r.hora_fin.substring(0, 5)} hs
            </p>
          </div>
        ))
      )}
    </div>
  );
}