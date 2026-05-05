import { useEffect, useState } from "react";

export default function AulasList() {
  const [aulas, setAulas] = useState([]);

  // 🔥 MAGIA: IP DINÁMICA
  const API_URL = `http://${window.location.hostname}:4000/api`;

  useEffect(() => {
    const fetchAulas = async () => {
      try {
        const token = localStorage.getItem("token");

        // 🔄 Usamos la IP dinámica en vez de localhost
        const res = await fetch(`${API_URL}/aulas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        
        // Evitamos errores si data no es un array
        if (Array.isArray(data)) {
          setAulas(data);
        } else {
          setAulas([]);
        }
      } catch (error) {
        console.error("Error cargando aulas:", error);
        setAulas([]);
      }
    };

    fetchAulas();
  }, []);

  if (!aulas.length) {
    return (
      <p className="text-gray-600 dark:text-gray-300">
        No hay aulas disponibles
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
      {aulas.map((aula) => (
        <div
          key={aula.id}
          className="
            bg-unrafLight
            dark:bg-[#1a1a1a]
            text-gray-800
            dark:text-gray-200
            px-3
            py-2
            rounded-lg
            text-sm
            text-center
            font-medium
            hover:bg-unrafGreen
            hover:text-white
            transition
            cursor-pointer
          "
        >
          {aula.nombre}
        </div>
      ))}
    </div>
  );
}