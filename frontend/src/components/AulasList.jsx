import { useEffect, useState } from "react";

export default function AulasList() {
  const [aulas, setAulas] = useState([]);

  useEffect(() => {
    const fetchAulas = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/api/aulas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAulas(data);
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