import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // 🔥 VALIDACIÓN FRONTEND: Bloquea si intenta registrarse sin @unraf.edu.ar
    if (isRegister && !form.email.endsWith("@unraf.edu.ar")) {
      setError("Debes usar un correo institucional (@unraf.edu.ar) para crear tu cuenta.");
      return;
    }

    const API_URL = `http://${window.location.hostname}:4000/api`;
    const url = isRegister
      ? `${API_URL}/auth/register`
      : `${API_URL}/auth/login`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    if (isRegister) {
      setMessage("Cuenta creada correctamente. Ahora inicia sesión.");
      setIsRegister(false);
    } else {
      login({ id: data.id }, data.token);
    }
  };

  return (
    <div className="min-h-screen flex bg-unrafLight dark:bg-[#0a0a0a] transition-colors duration-300">
      
      {/* PANEL IZQUIERDO: Branding e Información */}
      <div className="hidden lg:flex w-1/2 bg-unrafBlue flex-col justify-center items-start p-20 text-white relative overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-unrafGreen rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-unrafYellow rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        <div className="relative z-10">
          <img src="/unraf_logo-removebg-preview.png" alt="UNRaf Logo" className="h-24 mb-8 bg-white p-2 rounded-xl" />
          <h1 className="text-5xl font-bold mb-6 leading-tight">Gestión inteligente<br/>de aulas UNRaf</h1>
          <p className="text-lg text-blue-100 mb-8 max-w-md">
            Un sistema moderno y centralizado para la reserva de espacios y laboratorios.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-100">
              <svg className="h-6 w-6 text-unrafGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Disponibilidad en tiempo real</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <svg className="h-6 w-6 text-unrafYellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Gestión rápida y sin solapamientos</span>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white dark:bg-[#111111] dark:border dark:border-gray-800 p-10 rounded-3xl shadow-2xl transition-all">
          
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/unraf_logo-removebg-preview.png" alt="UNRaf" className="h-16" />
          </div>

          <h2 className="text-3xl font-bold mb-2 text-unrafBlue dark:text-white text-center">
            {isRegister ? "Crear una cuenta" : "¡Hola de nuevo!"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
            {isRegister ? "Completa tus datos para empezar" : "Ingresa tus credenciales institucionales"}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm text-center border border-green-200 dark:border-green-800">
              {message}
            </div>
          )}

          {/* 🔥 AGREGAMOS autoComplete="off" AL FORMULARIO */}
          <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-5">
            {isRegister && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Ej. Juan Pérez"
                  onChange={handleChange}
                  autoComplete="off" 
                  required
                  className="w-full border dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-[#1a1a1a] dark:text-white focus:ring-2 focus:ring-unrafGreen outline-none transition"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                placeholder="usuario@unraf.edu.ar"
                onChange={handleChange}
                autoComplete="off" 
                required
                className="w-full border dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-[#1a1a1a] dark:text-white focus:ring-2 focus:ring-unrafGreen outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
              {/* 🔥 AGREGAMOS autoComplete="new-password" PARA BLOQUEAR SUGERENCIAS */}
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                onChange={handleChange}
                autoComplete="new-password" 
                required
                minLength={isRegister ? 8 : undefined}
                title={isRegister ? "Debe tener al menos 8 caracteres" : ""}
                className="w-full border dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-[#1a1a1a] dark:text-white focus:ring-2 focus:ring-unrafGreen outline-none transition"
              />
            </div>

            <button className="mt-4 bg-unrafBlue dark:bg-unrafGreen text-white p-4 rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition duration-300">
              {isRegister ? "Registrarme" : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm space-y-4">
            {!isRegister ? (
              <>
                <Link to="/forgot-password" className="text-gray-500 dark:text-gray-400 hover:text-unrafYellow transition">
                  ¿Olvidaste tu contraseña?
                </Link>
                <div className="h-px bg-gray-200 dark:bg-gray-800 w-full my-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  ¿No tienes cuenta?{" "}
                  <button onClick={() => setIsRegister(true)} className="text-unrafGreen font-bold hover:underline">
                    Crear cuenta
                  </button>
                </p>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                ¿Ya tienes una cuenta?{" "}
                <button onClick={() => setIsRegister(false)} className="text-unrafGreen font-bold hover:underline">
                  Ingresar aquí
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}