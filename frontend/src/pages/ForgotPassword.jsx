import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    setMessage("Correo de recuperación enviado correctamente. Revisa tu bandeja de entrada.");
  };

  return (
    <div className="min-h-screen flex bg-unrafLight dark:bg-[#0a0a0a] transition-colors duration-300">
      
      {/* PANEL IZQUIERDO: Branding e Información (Oculto en celulares) */}
      <div className="hidden lg:flex w-1/2 bg-unrafBlue flex-col justify-center items-start p-20 text-white relative overflow-hidden">
        {/* Círculo decorativo de fondo */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-unrafGreen rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-unrafYellow rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        <div className="relative z-10">
          <img src="/unraf_logo-removebg-preview.png" alt="UNRaf Logo" className="h-24 mb-8 bg-white p-2 rounded-xl" />
          <h1 className="text-5xl font-bold mb-6 leading-tight">Recuperación<br/>de acceso</h1>
          <p className="text-lg text-blue-100 mb-8 max-w-md">
            No te preocupes, es normal olvidar la contraseña. Te ayudaremos a recuperar el acceso a tu cuenta en unos simples pasos.
          </p>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 text-blue-100">
              <svg className="h-6 w-6 text-unrafYellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Recibirás un enlace seguro en tu correo institucional</span>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white dark:bg-[#111111] dark:border dark:border-gray-800 p-10 rounded-3xl shadow-2xl transition-all">
          
          {/* Logo solo para móvil */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/unraf_logo-removebg-preview.png" alt="UNRaf" className="h-16" />
          </div>

          <h2 className="text-3xl font-bold mb-2 text-unrafBlue dark:text-white text-center">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
            Ingresa tu correo institucional y te enviaremos las instrucciones para cambiarla.
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
              <input
                type="email"
                placeholder="usuario@unraf.edu.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-[#1a1a1a] dark:text-white focus:ring-2 focus:ring-unrafGreen outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="mt-4 bg-unrafBlue dark:bg-unrafGreen text-white p-4 rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition duration-300"
            >
              Enviar enlace
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-unrafGreen font-semibold transition flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio de sesión
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}