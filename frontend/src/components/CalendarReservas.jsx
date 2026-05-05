import { useEffect, useState } from "react";

export default function CalendarReservas() {
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");

  // 🔥 MAGIA: IP DINÁMICA
  const API_URL = `http://${window.location.hostname}:4000/api`;

  const fetchMisReservas = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/reservas/mis-reservas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error cargando tus reservas");
        setReservas([]);
        return;
      }

      setReservas(Array.isArray(data) ? data : []);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Error de conexión");
      setReservas([]);
    }
  };

  useEffect(() => {
    fetchMisReservas();

    const interval = setInterval(fetchMisReservas, 5000);
    return () => clearInterval(interval);
  }, []);

  const cancelarReserva = async (id) => {
    // 🔥 Borrado directo. Sin confirm ni alert.
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/reservas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "No se pudo cancelar");
        return;
      }

      // Se actualiza la lista al instante
      fetchMisReservas();
    } catch (error) {
      console.error(error);
      setError("Error de conexión");
    }
  };

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-2">{error}</p>
        <button 
          onClick={fetchMisReservas}
          className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (reservas.length === 0) {
    return <p className="text-gray-400 text-center p-4">No tenés reservas creadas</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reservas.map((r) => (
        <div
          key={r.id}
          className="bg-unrafLight dark:bg-[#1a1a1a] border dark:border-gray-700 p-4 rounded-xl transition hover:shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-800 dark:text-white text-lg">
                {r.aula_nombre}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(r.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="text-sm font-medium text-unrafBlue dark:text-blue-400 mt-1">
                {r.hora_inicio.substring(0, 5)} hs - {r.hora_fin.substring(0, 5)} hs
              </p>
            </div>
            
            <button
              onClick={() => cancelarReserva(r.id)}
              className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
              title="Cancelar Reserva"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}