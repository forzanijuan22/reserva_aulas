import { useEffect, useState } from "react";

export default function ReservaForm({ onReservaCreada }) {
  const [aulas, setAulas] = useState([]);
  const [form, setForm] = useState({
    aula_id: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 🔄 CARGAR AULAS
  useEffect(() => {
    const fetchAulas = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:4000/api/aulas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        // 🛑 EVITA ERROR .map
        if (Array.isArray(data)) {
          setAulas(data);
        } else {
          console.error("Error aulas:", data);
          setAulas([]);
        }

      } catch (err) {
        console.error("Error fetch aulas:", err);
        setAulas([]);
      }
    };

    fetchAulas();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🟢 CREAR RESERVA
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al crear reserva");
        return;
      }

      setMessage("Reserva creada correctamente ✅");

      // 🔄 refrescar
      onReservaCreada();

      // 🔄 limpiar form
      setForm({
        aula_id: "",
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
      });

    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* SELECT AULA */}
      <select
        name="aula_id"
        value={form.aula_id}
        onChange={handleChange}
        required
        className="border rounded-lg p-3 bg-white dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white"
      >
        <option value="">Seleccionar aula</option>

        {Array.isArray(aulas) &&
          aulas.map((aula) => (
            <option key={aula.id} value={aula.id}>
              {aula.nombre}
            </option>
          ))}
      </select>

      {/* FECHA */}
      <input
        type="date"
        name="fecha"
        value={form.fecha}
        onChange={handleChange}
        required
        className="border rounded-lg p-3 bg-white dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white"
      />

      {/* HORAS */}
      <div className="grid grid-cols-2 gap-3">
        <input
          type="time"
          name="hora_inicio"
          value={form.hora_inicio}
          onChange={handleChange}
          required
          className="border rounded-lg p-3 bg-white dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white"
        />

        <input
          type="time"
          name="hora_fin"
          value={form.hora_fin}
          onChange={handleChange}
          required
          className="border rounded-lg p-3 bg-white dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white"
        />
      </div>

      {/* BOTÓN */}
      <button
        type="submit"
        className="bg-unrafBlue text-white p-3 rounded-lg hover:bg-unrafGreen transition"
      >
        Reservar
      </button>

      {/* MENSAJES */}
      {message && (
        <p className="text-green-600 dark:text-green-400 text-sm">
          {message}
        </p>
      )}

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </p>
      )}
    </form>
  );
}