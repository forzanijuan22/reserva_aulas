🏫 Sistema de Gestión Inteligente de Aulas UNRaf

Trabajo Práctico Final — Materia: Programación

Universidad Nacional de Rafaela (UNRaf) — Año 2026

Autores: Juan Ignacio Forzani y Facundo Moscardo

Docentes: Javier Fornari y Luis Ferrario

📌 Descripción

El Sistema de Gestión Inteligente de Aulas es una aplicación web Full-Stack diseñada para centralizar, agilizar y asegurar la asignación de espacios físicos dentro de la universidad. Permite al personal docente consultar la disponibilidad en tiempo real, efectuar reservas sin solapamientos horarios y administrar sus propios espacios. Todo esto asistido por "UniBot", un agente de Inteligencia Artificial integrado con reconocimiento de voz.

🧱 Stack tecnológico

| Capa | Tecnología |
| Frontend | React + Vite + Tailwind CSS |
| Enrutamiento | React Router DOM (Single Page Application) |
| Backend | Node.js + Express.js |
| Base de datos | MySQL (Estructura Relacional) |
| Seguridad y Auth | JSON Web Tokens (JWT) + Bcryptjs |
| Correos / SMTP | Nodemailer |
| Inteligencia Artificial | Groq API (Llama-3.1-8b-instant) |

🚀 Instalación y uso local

Requisitos previos

Node.js 18+

Servidor MySQL local (XAMPP, Workbench o similar)

Una API key de Groq

Una contraseña de aplicación de Google (para el envío de correos)

1. Clonar el repositorio

git clone [https://github.com/forzanijuan22/reserva_aulas.git](https://github.com/forzanijuan22/reserva_aulas.git)
cd reserva_aulas


2. Configurar la Base de Datos

Abre tu gestor de MySQL.

Crea una base de datos vacía (ej. gestion_aulas).

Ejecuta el script SQL proporcionado en el proyecto para generar las tablas usuarios, aulas y reservas.

3. Configurar el Backend

cd backend
npm install


Crear un archivo .env en la carpeta backend con las siguientes variables:

PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=gestion_aulas
JWT_SECRET=tu_palabra_secreta_super_segura
GROQ_API_KEY=gsk_tu_api_key_de_groq_aqui
EMAIL_USER=tu_correo_institucional@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion_google




Levantar el servidor:

npm run dev
# o usando node: node index.js




4. Configurar el Frontend

Abre otra terminal y sitúate en la raíz del proyecto.

cd frontend
npm install



Para levantar el proyecto y permitir la conexión de otros dispositivos en la red local (teléfonos celulares, tablets), ejecuta:

npm run dev -- --host



✨ Funcionalidades Principales

Dashboard en Tiempo Real: Visualización asincrónica de aulas ocupadas, reservas personales y panel de nueva reserva.

Autenticación Institucional: Registro restringido exclusivamente a dominios @unraf.edu.ar y mitigación de autocompletado inseguro en terminales compartidas.

UniBot Integrado: Chatbot inteligente impulsado por IA con reconocimiento por voz (Web Speech API) capaz de interpretar disponibilidades y agendar aulas mediante lenguaje natural.

Portabilidad de Red (LAN): Detección dinámica de IP mediante window.location.hostname para poder probar el sistema desde dispositivos móviles conectados al mismo Wi-Fi sin reconfigurar código.

Recuperación de Credenciales: Sistema de envío de tokens temporales de recuperación vía correo electrónico transaccional.

Mantenimiento Autónomo: Limpieza automática de registros históricos en la base de datos para reservas vencidas.
