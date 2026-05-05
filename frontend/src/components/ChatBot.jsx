import { useState, useRef, useEffect } from "react";
import unibotAvatar from "../assets/unibot-avatar.svg"; 

export default function ChatBot({ onReservaExitosa }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "¡Hola! Soy UniBot. Puedes escribirme o tocar el micrófono para hablarme. ¿En qué te ayudo?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const sugerencias = [
    "¿Qué hay hoy?",
    "¿Está libre el Aula 1 mañana a las 18?",
    "Reservar el Aula 1 hoy a las 20:00",
    "Cancelar mi reserva de hoy"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // 🔥 FUNCIÓN PARA QUE UNIBOT HABLE (Voz Premium)
  const hablar = (texto) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const textoLimpio = texto.replace(/[*#]/g, ''); 
      const mensajeVoz = new SpeechSynthesisUtterance(textoLimpio);
      
      mensajeVoz.lang = 'es-AR'; 
      mensajeVoz.rate = 1.0; 
      mensajeVoz.pitch = 1.1; // Un tono un poquito más agudo y amable

      // Buscamos la mejor voz instalada en el dispositivo
      const voces = window.speechSynthesis.getVoices();
      const vozPremium = voces.find(v => v.name.includes('Google') && v.lang.includes('es'))
                      || voces.find(v => v.name.includes('Sabina') || v.name.includes('Helena') || v.name.includes('Laura'))
                      || voces.find(v => v.lang === 'es-AR')
                      || voces.find(v => v.lang.startsWith('es'));

      if (vozPremium) {
        mensajeVoz.voice = vozPremium;
      }

      window.speechSynthesis.speak(mensajeVoz);
    }
  };

  // 🔥 FUNCIÓN PARA ESCUCHAR EL MICRÓFONO
  const iniciarEscucha = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta el micrófono. Usá Google Chrome o Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-AR';
    recognition.continuous = false; 
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      enviarMensaje(transcript); 
    };

    recognition.onerror = (event) => {
      console.error("Error de micrófono:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const enviarMensaje = async (textoAEnviar) => {
    const texto = textoAEnviar || input;
    if (!texto.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: texto }]);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const API_URL = `http://${window.location.hostname}:4000/api`;

      const res = await fetch(`${API_URL}/ia/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mensaje: texto, historial: messages }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.respuesta }]);

      // Reproducimos el audio de la respuesta
      hablar(data.respuesta);

      if (data.respuesta.includes("¡Éxito!")) {
        if (onReservaExitosa) onReservaExitosa();
      }

    } catch (error) {
      console.error(error);
      const errorMsg = "Error de conexión con mi cerebro.";
      setMessages((prev) => [...prev, { sender: "bot", text: errorMsg }]);
      hablar(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargamos las voces apenas se abre la app por si el navegador es un poco lento
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="bg-white dark:bg-[#111111] w-[90vw] sm:w-96 h-[550px] rounded-3xl shadow-2xl mb-4 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-300 transform origin-bottom-right">
          
          <div className="bg-unrafBlue dark:bg-[#1a1a1a] text-white p-6 flex justify-between items-center shadow-md relative overflow-hidden border-b-2 border-unrafGreen">
            <div className="absolute top-0 right-0 w-32 h-32 bg-unrafGreen rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white p-1 rounded-full shadow-lg">
                <img src={unibotAvatar} alt="UniBot Avatar" className="h-12 w-12" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl">UniBot</h3>
                <p className="text-unrafGreen text-sm font-medium">Asistente Inteligente</p>
              </div>
            </div>
            
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-5 overflow-y-auto bg-unrafLight/30 dark:bg-[#0d0d0d] flex flex-col gap-4 scrollbar-thin">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender === "bot" && (
                    <img src={unibotAvatar} alt="UniBot Small" className="h-7 w-7 mt-1 p-0.5 bg-unrafBlue rounded-full shadow" />
                )}
                <div className={`max-w-[75%] p-4 rounded-2xl text-sm ${
                  msg.sender === "user" 
                    ? "bg-unrafBlue dark:bg-unrafGreen text-white rounded-tr-sm shadow-md" 
                    : "bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 border dark:border-gray-800 rounded-tl-sm shadow-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-center gap-2.5">
                <img src={unibotAvatar} alt="UniBot Loading" className="h-7 w-7 p-0.5 bg-unrafBlue rounded-full shadow" />
                <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl rounded-tl-sm border dark:border-gray-800 shadow-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-5 py-3 bg-white dark:bg-[#111111] flex gap-2 overflow-x-auto border-t dark:border-gray-800 scrollbar-hide">
            {sugerencias.map((sug, i) => (
              <button
                key={i}
                onClick={() => enviarMensaje(sug)}
                className="whitespace-nowrap bg-unrafLight/60 dark:bg-gray-800 hover:bg-unrafGreen hover:text-white dark:hover:bg-gray-700 text-unrafBlue dark:text-gray-300 text-xs px-4 py-2 rounded-full border border-unrafGreen/20 dark:border-gray-700 transition font-medium"
              >
                {sug}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); enviarMensaje(); }}
            className="p-4 bg-white dark:bg-[#111111] border-t dark:border-gray-800 flex items-center gap-2"
          >
            <button 
              type="button"
              onClick={iniciarEscucha}
              className={`p-3 rounded-full transition-all shadow-md flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'}`}
              title="Hablar por micrófono"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Te estoy escuchando..." : "Escribe tu mensaje..."}
              disabled={isListening}
              className="flex-1 border dark:border-gray-700 rounded-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] dark:text-white focus:outline-none focus:ring-2 focus:ring-unrafGreen text-sm disabled:opacity-50"
            />
            
            <button type="submit" disabled={isLoading || !input.trim()} className="bg-unrafGreen text-white p-3 rounded-full hover:bg-opacity-90 disabled:opacity-50 shadow-md transform active:scale-95 transition-all flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className={`${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-unrafBlue dark:bg-unrafGreen hover:scale-110'} text-white p-4 rounded-full shadow-2xl transition-all relative`}>
        {isOpen ? <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               : <><img src={unibotAvatar} alt="UniBot" className="h-10 w-10 p-0.5 bg-white rounded-full shadow-inner" />
                   <div className="absolute -top-1 -left-1 bg-unrafYellow text-unrafBlue text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center animate-pulse border-2 border-unrafBlue">!</div></>}
      </button>
    </div>
  );
}