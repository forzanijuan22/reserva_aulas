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

    const url = isRegister
      ? "http://localhost:4000/api/auth/register"
      : "http://localhost:4000/api/auth/login";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    console.log("RESPUESTA LOGIN:", data); // 🔍 debug

    if (!res.ok) {
      setError(data.message);
      return;
    }

    if (isRegister) {
      setMessage("Cuenta creada correctamente. Ahora inicia sesión.");
      setIsRegister(false);
    } else {
      // 🔥 ESTA ES LA CLAVE
      login({ id: data.id }, data.token);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-unrafLight">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96">

        <div className="flex justify-center mb-6">
          <img
            src="/src/assets/unraf_logo.png"
            alt="Logo"
            className="h-16"
          />
        </div>

        <h2 className="text-2xl font-semibold mb-6 text-center text-unrafBlue">
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h2>

        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 text-green-600 text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {isRegister && (
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              onChange={handleChange}
              required
              className="border rounded-lg p-3 focus:ring-2 focus:ring-unrafGreen outline-none"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Correo institucional"
            onChange={handleChange}
            required
            className="border rounded-lg p-3 focus:ring-2 focus:ring-unrafGreen outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            onChange={handleChange}
            required
            className="border rounded-lg p-3 focus:ring-2 focus:ring-unrafGreen outline-none"
          />

          <button
            className="bg-unrafBlue text-white p-3 rounded-lg hover:bg-unrafGreen transition"
          >
            {isRegister ? "Registrarse" : "Ingresar"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">

          {!isRegister ? (
            <>
              <p>
                ¿No tienes cuenta?{" "}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-unrafGreen font-semibold hover:underline"
                >
                  Crear cuenta
                </button>
              </p>

              <Link
                to="/forgot-password"
                className="block mt-2 text-unrafYellow hover:underline"
              >
                ¿Has olvidado tu contraseña?
              </Link>
            </>
          ) : (
            <p>
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => setIsRegister(false)}
                className="text-unrafGreen font-semibold hover:underline"
              >
                Iniciar sesión
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}