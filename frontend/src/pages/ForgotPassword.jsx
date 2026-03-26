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

    const res = await fetch("http://localhost:4000/api/auth/forgot-password", {
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

    setMessage("Correo de recuperación enviado correctamente");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-unrafLight dark:bg-black transition">

      <div className="bg-white dark:bg-[#111111] dark:border dark:border-gray-800 p-10 rounded-2xl shadow-xl w-96 transition">

        <div className="flex justify-center mb-6">
          <img
            src="/unraf_logo-removebg-preview.png"
            alt="UNRaf"
            className="h-16"
          />
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
          Recuperar contraseña
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="Correo institucional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="
              border
              rounded-lg
              p-3
              bg-white
              dark:bg-[#1a1a1a]
              dark:border-gray-700
              dark:text-white
              placeholder-gray-500
              dark:placeholder-gray-400
              focus:ring-2
              focus:ring-unrafGreen
              outline-none
              transition
            "
          />

          <button
            type="submit"
            className="
              bg-unrafBlue
              text-white
              p-3
              rounded-lg
              hover:bg-unrafGreen
              transition
            "
          >
            Enviar enlace
          </button>

          {message && (
            <p className="text-green-600 dark:text-green-400 text-sm text-center">
              {message}
            </p>
          )}

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </p>
          )}
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            to="/"
            className="text-unrafGreen hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </div>

      </div>
    </div>
  );
}