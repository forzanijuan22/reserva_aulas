import { useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

     const API_URL = `http://${window.location.hostname}:4000/api`;

    try {
      const res = await fetch(
        `${API_URL}/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "No se pudo cambiar la contraseña");
        return;
      }

      setMessage("¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.");
      setPassword("");
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="min-h-screen flex bg-unrafLight dark:bg-[#0a0a0a] transition-colors duration-300">
      
      {/* PANEL IZQUIERDO: Branding e Información */}
      <div className="hidden lg:flex w-1/2 bg-unrafBlue flex-col justify-center items-start p-20 text-white relative overflow-hidden">
        <div className="absolute top-1/4 -right-10 w-96 h-96 bg-unrafGreen rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-unrafYellow rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <img src="/unraf_logo-removebg-preview.png" alt="UNRaf Logo" className="h-24 mb-8 bg-white p-2 rounded-xl" />
          <h1 className="text-5xl font-bold mb-6 leading-tight">Protege<br/>tu cuenta</h1>
          <p className="text-lg text-blue-100 mb-8 max-w-md">
            Estás a un paso de recuperar tu acceso. Ingresa una nueva contraseña que sea segura y fácil de recordar.
          </p>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 text-blue-100">
              <svg className="h-6 w-6 text-unrafGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Usa al menos 8 caracteres para mayor seguridad</span>
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
            Cambiar contraseña
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
            Escribe tu nueva contraseña a continuación.
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nueva Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8} // 🔥 Exigir siempre 8 caracteres
                title="Debe tener al menos 8 caracteres" // 🔥 Mensaje de ayuda
                className="w-full border dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-[#1a1a1a] dark:text-white focus:ring-2 focus:ring-unrafGreen outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="mt-4 bg-unrafBlue dark:bg-unrafGreen text-white p-4 rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition duration-300"
            >
              Guardar contraseña
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