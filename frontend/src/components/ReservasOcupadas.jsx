import { useEffect, useState } from "react";

export default function ReservasOcupadas() {
  const [reservas, setReservas] = useState([]);

  const fetchReservasOcupadas = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/api/reservas/ocupadas", {
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
    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
      {reservas.length === 0 ? (
        <p className="text-gray-400">No hay reservas</p>
      ) : (
        reservas.map((r) => (
          <div
            key={r.id}
            className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-lg text-sm font-medium"
          >
            <p>{r.aula_nombre}</p>
            <p className="text-xs">{new Date(r.fecha).toLocaleDateString()}</p>
            <p className="text-xs">
              {r.hora_inicio} - {r.hora_fin}
            </p>
          </div>
        ))
      )}
    </div>
  );
}