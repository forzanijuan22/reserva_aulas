import Navbar from "../components/Navbar";
import ReservaForm from "../components/ReservaForm";
import CalendarReservas from "../components/CalendarReservas";
import ReservasOcupadas from "../components/ReservasOcupadas";
import { useEffect, useState } from "react";


export default function Dashboard() {
  const [reservasOcupadas, setReservasOcupadas] = useState([]);
  const [misReservas, setMisReservas] = useState([]);
  const [errorOcupadas, setErrorOcupadas] = useState("");
  const [errorMisReservas, setErrorMisReservas] = useState("");

  const cerrarSesionPorTokenInvalido = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const fetchHorariosOcupados = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/";
        return;
      }

      const res = await fetch("http://localhost:4000/api/reservas/ocupadas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.message === "No autorizado") {
        cerrarSesionPorTokenInvalido();
        return;
      }

      if (Array.isArray(data)) {
        setReservasOcupadas(data);
        setErrorOcupadas("");
      } else {
        setReservasOcupadas([]);
        setErrorOcupadas("Error cargando horarios ocupados");
      }
    } catch (err) {
      console.error(err);
      setReservasOcupadas([]);
      setErrorOcupadas("Error de conexión");
    }
  };

  const fetchMisReservas = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/";
        return;
      }

      const res = await fetch("http://localhost:4000/api/reservas/mis-reservas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.message === "No autorizado") {
        cerrarSesionPorTokenInvalido();
        return;
      }

      if (Array.isArray(data)) {
        setMisReservas(data);
        setErrorMisReservas("");
      } else {
        setMisReservas([]);
        setErrorMisReservas("Error cargando tus reservas");
      }
    } catch (err) {
      console.error(err);
      setMisReservas([]);
      setErrorMisReservas("Error de conexión");
    }
  };

  const recargarTodo = () => {
    fetchHorariosOcupados();
    fetchMisReservas();
  };

  useEffect(() => {
    recargarTodo();

    const interval = setInterval(() => {
      recargarTodo();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-unrafLight dark:bg-black dark:text-white transition">
      <Navbar />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 max-w-7xl mx-auto">
        {/* 🔴 HORARIOS OCUPADOS */}
        <div className="bg-white dark:bg-[#111111] dark:border dark:border-gray-800 p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Horarios ocupados
          </h2>

          {errorOcupadas ? (
            <p className="text-red-500">{errorOcupadas}</p>
          ) : (
            <ReservasOcupadas reservas={reservasOcupadas} />
          )}
        </div>

        {/* 🟢 FORM */}
        <div className="bg-white dark:bg-[#111111] dark:border dark:border-gray-800 p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Crear reserva
          </h2>

          <ReservaForm onReservaCreada={recargarTodo} />
        </div>

        {/* 🔵 MIS RESERVAS */}
        <div className="bg-white dark:bg-[#111111] dark:border dark:border-gray-800 p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Mis reservas
          </h2>

          {errorMisReservas ? (
            <p className="text-red-500">{errorMisReservas}</p>
          ) : (
            <CalendarReservas
              reservas={misReservas}
              onActualizar={fetchMisReservas}
            />
          )}
        </div>
      </div>
    </div>
  );
}