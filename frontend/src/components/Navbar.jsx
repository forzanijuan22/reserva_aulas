import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useContext(AuthContext);
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <div className="bg-unrafBlue dark:bg-black text-white px-8 py-4 flex justify-between items-center shadow-lg transition duration-300 border-b border-transparent dark:border-gray-800">

      <div className="flex items-center gap-4">
        <div className="bg-white p-1 rounded-full">
          <img
            src="/unraf_logo-removebg-preview.png"
            alt="UNRaf"
            className="h-10 w-10 object-contain"
          />
        </div>
        <h1 className="text-xl font-bold tracking-wide hidden sm:block">
          Sistema de Reservas
        </h1>
      </div>

      <div className="flex items-center gap-6">

        {/* Botón Sol y Luna */}
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800 transition duration-300"
          title={dark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        >
          {dark ? (
            // Ícono de Sol
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            // Ícono de Luna
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-unrafYellow/90 hover:bg-unrafYellow text-unrafBlue dark:bg-yellow-600 dark:hover:bg-yellow-500 dark:text-white px-5 py-2 rounded-lg font-bold transition shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Salir
        </button>

      </div>
    </div>
  );
}