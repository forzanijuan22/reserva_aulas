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
    <div className="bg-unrafBlue dark:bg-black text-white px-8 py-4 flex justify-between items-center shadow-md transition">

      <div className="flex items-center gap-3">
        <img
          src="/unraf_logo-removebg-preview.png"
          alt="UNRaf"
          className="h-12"
        />
        <h1 className="text-xl font-semibold">
          Sistema de Reserva de Aulas
        </h1>
      </div>

      <div className="flex items-center gap-4">

        <button
          onClick={() => setDark(!dark)}
          className="bg-unrafGreen dark:bg-gray-800 dark:border dark:border-gray-700 px-4 py-2 rounded-lg transition"
        >
          {dark ? "Modo claro" : "Modo oscuro"}
        </button>

        <button
          onClick={logout}
          className="bg-unrafYellow text-unrafBlue dark:bg-yellow-500 dark:text-black px-4 py-2 rounded-lg font-semibold transition"
        >
          Cerrar sesión
        </button>

      </div>
    </div>
  );
}