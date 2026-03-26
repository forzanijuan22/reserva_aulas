import { useEffect, useState } from "react";

export default function CalendarReservas() {
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");

  const fetchMisReservas = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/api/reservas/mis-reservas", {
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
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:4000/api/reservas/${id}`, {
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

      fetchMisReservas();
    } catch (error) {
      console.error(error);
      setError("Error de conexión");
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (reservas.length === 0) {
    return <p className="text-gray-400">No tenés reservas creadas</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reservas.map((r) => (
        <div
          key={r.id}
          className="bg-unrafLight dark:bg-[#1a1a1a] border dark:border-gray-700 p-4 rounded-xl transition"
        >
          <p className="font-semibold text-gray-800 dark:text-white">
            {r.aula_nombre}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            {new Date(r.fecha).toLocaleDateString()} | {r.hora_inicio} - {r.hora_fin}
          </p>

          <button
            onClick={() => cancelarReserva(r.id)}
            className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg transition"
          >
            Cancelar
          </button>
        </div>
      ))}
    </div>
  );
}