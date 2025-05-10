import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
// import { checkConnection } from "./lib/supabase"; // Comentado por ahora para simplificar
import { Toaster } from 'sonner';
// import { autoLoadEnvVariables } from "./lib/envLoader.js"; // Comentado por ahora

// TempoDevtools puede causar problemas, lo comentamos temporalmente
// import { TempoDevtools } from "tempo-devtools";
// TempoDevtools.init();

// Declaración de tipos para window (puede eliminarse si no se usa)
declare global {
  interface Window {
    // Limpiar interfaces innecesarias añadidas previamente
  }
}

// Eliminar el forzado de variables y la detección de Edge

// Eliminar la carga automática explícita, Vite debería manejarlo
// if (import.meta.env.DEV) {
//   console.log("Inicializando carga automática de variables de entorno...");
//   autoLoadEnvVariables();
// }

const basename = import.meta.env.BASE_URL;

// Debug environment variables estándar
console.log("===== DEBUG ENVIRONMENT VARIABLES (main.tsx) =====");
console.log("BASE_URL:", basename || 'Not set');
console.log("MODE:", import.meta.env.MODE);
console.log("DEV:", import.meta.env.DEV);
console.log("PROD:", import.meta.env.PROD);
console.log("VITE_SUPABASE_URL exists:", !!import.meta.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY exists:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log("===========================================");

// Eliminar la clase de carga inicial, manejarla dentro de React si es necesario
// document.documentElement.classList.add('js-loading');

// Renderizado estándar de React
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Error crítico: No se encontró el elemento 'root' en el DOM.");
  // Mostrar error directamente en el body si no hay root
  document.body.innerHTML = `<div style='padding: 20px; color: red; text-align: center;'>Error Crítico: Elemento 'root' no encontrado.</div>`;
} else {
  console.log("Elemento 'root' encontrado. Intentando renderizar React...");
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter 
          basename={basename}
          // Usar configuración futura recomendada si aplica
          // future={{ 
          //   v7_startTransition: true,
          //   v7_relativeSplatPath: true 
          // }}
        >
          <Toaster position="top-right" richColors />
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    );
    console.log("React renderizado iniciado.");
  } catch (error) {
    console.error("Error CRÍTICO al intentar renderizar React:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; color: red;">
        <h2>Error al Iniciar React</h2>
        <p>Ocurrió un error fatal durante el montaje inicial de la aplicación.</p>
        <pre style="text-align: left; background: #eee; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${error.message}\n${error.stack}</pre>
        <p>Revise la consola del navegador para más detalles.</p>
      </div>
    `;
  }
}

// Eliminar la lógica de remover 'js-loading' y los imports de diagnóstico
