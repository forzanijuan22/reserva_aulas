import Navbar from "../components/Navbar";
import ReservaForm from "../components/ReservaForm";
import CalendarReservas from "../components/CalendarReservas";
import ReservasOcupadas from "../components/ReservasOcupadas";
import ChatBot from "../components/ChatBot"; 
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [reservasOcupadas, setReservasOcupadas] = useState([]);
  const [misReservas, setMisReservas] = useState([]);
  const [errorOcupadas, setErrorOcupadas] = useState("");
  const [errorMisReservas, setErrorMisReservas] = useState("");
  const [userName, setUserName] = useState("");
  
  // Fecha actual para el encabezado
  const hoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const cerrarSesionPorTokenInvalido = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const API_URL = `http://${window.location.hostname}:4000/api`;

  const fetchHorariosOcupados = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { window.location.href = "/"; return; }

      const res = await fetch(`${API_URL}/reservas/ocupadas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.message === "No autorizado") { cerrarSesionPorTokenInvalido(); return; }

      if (Array.isArray(data)) {
        const dataSinSegundos = data.map(reserva => ({
          ...reserva,
          hora_inicio: reserva.hora_inicio ? reserva.hora_inicio.substring(0, 5) : null,
          hora_fin: reserva.hora_fin ? reserva.hora_fin.substring(0, 5) : null
        }));
        setReservasOcupadas(dataSinSegundos);
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
      if (!token) { window.location.href = "/"; return; }

      const res = await fetch(`${API_URL}/reservas/mis-reservas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.message === "No autorizado") { cerrarSesionPorTokenInvalido(); return; }

      if (Array.isArray(data)) {
        const dataSinSegundos = data.map(reserva => ({
          ...reserva,
          hora_inicio: reserva.hora_inicio ? reserva.hora_inicio.substring(0, 5) : null,
          hora_fin: reserva.hora_fin ? reserva.hora_fin.substring(0, 5) : null
        }));
        setMisReservas(dataSinSegundos);
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
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const userObj = JSON.parse(userString);
        setUserName(userObj.nombre || "Docente");
      } catch (e) {
        setUserName("Docente");
      }
    }

    recargarTodo();
    const interval = setInterval(() => { recargarTodo(); }, 5000); // 5 seg es ideal para no saturar
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 transition duration-300 font-sans pb-10">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* HEADER ADMINISTRATIVO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium capitalize mb-1">{hoy}</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Panel de Control
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Bienvenido/a de nuevo, <span className="font-semibold text-unrafBlue dark:text-blue-400">{userName}</span>.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Sistema en línea
            </span>
          </div>
        </div>

        {/* TARJETAS DE MÉTRICAS (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* KPI 1: Aulas Ocupadas */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aulas Ocupadas Hoy</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{reservasOcupadas.length}</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          {/* KPI 2: Mis Reservas */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-unrafBlue"></div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mis Reservas Activas</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{misReservas.length}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-unrafBlue">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* KPI 3: Acción Rápida (Estético/Funcional) */}
          <div className="bg-gradient-to-br from-unrafBlue to-unrafBlue/80 rounded-2xl p-6 shadow-md flex items-center justify-between text-white relative overflow-hidden">
            <svg className="absolute right-0 top-0 h-full w-1/2 opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor"><polygon points="0,100 100,0 100,100" /></svg>
            <div className="relative z-10">
              <p className="text-sm font-medium text-blue-100">Gestión Inteligente</p>
              <p className="text-lg font-bold mt-1 leading-tight">Optimice el uso<br/>de espacios</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm relative z-10">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* GRID PRINCIPAL (Layout Asimétrico 2/1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA (Más ancha para la lista general) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a1a1a]/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-red-500 rounded-full"></div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Horarios ocupados</h2>
                </div>
                <span className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">Actualizado en vivo</span>
              </div>
              <div className="p-6 flex-grow">
                {errorOcupadas ? (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{errorOcupadas}</div>
                ) : (
                  <ReservasOcupadas reservas={reservasOcupadas} />
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA (Acciones y Reservas Propias) */}
          <div className="flex flex-col gap-8">
            
            {/* Formulario de Reserva */}
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-unrafGreen"></div>
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-unrafGreen">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Nueva Reserva</h2>
              </div>
              <div className="p-6">
                <ReservaForm onReservaCreada={recargarTodo} />
              </div>
            </div>

            {/* Mis Reservas */}
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-unrafBlue">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Mis Reservas</h2>
              </div>
              <div className="p-6">
                {errorMisReservas ? (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{errorMisReservas}</div>
                ) : (
                  <CalendarReservas reservas={misReservas} onActualizar={fetchMisReservas} />
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <ChatBot onReservaExitosa={recargarTodo} />
    </div>
  );
}