import React, { useState, useEffect } from 'react';
import { checkEnvVariables, loadEnvVariables } from '@/lib/envLoader';

/**
 * A diagnostic component for development mode only
 * IMPORTANT: This component should NEVER be included in production builds
 */
export function EnvDiagnostics() {
  const [envStatus, setEnvStatus] = useState<any>(null);
  const [envDetails, setEnvDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Función mejorada para obtener detalles avanzados del entorno
  const getDetailedEnvInfo = () => {
    // Verificar las variables de entorno desde diferentes fuentes
    const importMetaEnv = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'No disponible',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada (oculta)' : 'No disponible'
    };

    // Verificar window
    const windowEnv = {
      VITE_SUPABASE_URL: window.VITE_SUPABASE_URL || 'No disponible',
      VITE_SUPABASE_ANON_KEY: window.VITE_SUPABASE_ANON_KEY ? 'Configurada (oculta)' : 'No disponible'
    };

    // Verificar localStorage (solo en entorno seguro)
    let localStorageEnv = { VITE_SUPABASE_URL: 'No accesible', VITE_SUPABASE_ANON_KEY: 'No accesible' };
    try {
      localStorageEnv = {
        VITE_SUPABASE_URL: localStorage.getItem('debug_vite_supabase_url') || 'No disponible',
        VITE_SUPABASE_ANON_KEY: localStorage.getItem('debug_vite_supabase_anon_key') ? 'Configurada (oculta)' : 'No disponible'
      };
    } catch (e) {
      console.warn('No se pudo acceder a localStorage', e);
    }

    return {
      importMetaEnv,
      windowEnv,
      localStorageEnv,
      processEnv: 'No accesible en el navegador',
      viteConfig: {
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
        prod: import.meta.env.PROD,
        base: import.meta.env.BASE_URL
      }
    };
  };

  useEffect(() => {
    if (import.meta.env.PROD) {
      console.error('EnvDiagnostics component should not be used in production!');
      return;
    }
    
    setEnvStatus(checkEnvVariables());
    setEnvDetails(getDetailedEnvInfo());
  }, []);

  const handleLoadVariables = () => {
    setLoading(true);
    
    try {
      const result = loadEnvVariables({
        VITE_SUPABASE_URL: customUrl || undefined,
        VITE_SUPABASE_ANON_KEY: customKey || undefined
      });
      
      if (result.success) {
        setEnvStatus(checkEnvVariables());
        setEnvDetails(getDetailedEnvInfo());
        setMessage({
          type: 'success',
          text: 'Variables cargadas. Actualice la página para aplicar los cambios.'
        });
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Error al cargar las variables'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error: ${error instanceof Error ? error.message : 'Desconocido'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearVariables = () => {
    // Borrar localStorage
    try {
      localStorage.removeItem('debug_vite_supabase_url');
      localStorage.removeItem('debug_vite_supabase_anon_key');
    } catch (e) {
      console.warn('No se pudo acceder a localStorage', e);
    }
    
    // Borrar window
    if (window.VITE_SUPABASE_URL) delete window.VITE_SUPABASE_URL;
    if (window.VITE_SUPABASE_ANON_KEY) delete window.VITE_SUPABASE_ANON_KEY;
    
    // Actualizar estado
    setEnvStatus(checkEnvVariables());
    setEnvDetails(getDetailedEnvInfo());
    setMessage({
      type: 'success',
      text: 'Variables de entorno borradas'
    });
  };

  // Si la aplicación está en modo producción, no mostrar el diagnóstico
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        color: '#e11d48', 
        borderBottom: '2px solid #e11d48',
        paddingBottom: '10px'
      }}>
        IT CARGO - Herramientas de Diagnóstico
      </h2>
      
      <p>La aplicación React no se ha cargado correctamente. Usa estas herramientas para diagnosticar:</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => {
            setEnvStatus(checkEnvVariables());
            setEnvDetails(getDetailedEnvInfo());
          }}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Ejecutar Diagnóstico
        </button>
        
        <button 
          onClick={handleClearVariables}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Limpiar localStorage
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Recargar Página
        </button>
      </div>
      
      <div style={{ 
        backgroundColor: '#1e293b', 
        color: '#e2e8f0', 
        padding: '16px', 
        borderRadius: '4px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        overflowX: 'auto',
        maxHeight: '60vh',
        overflowY: 'auto'
      }}>
        <p>Ejecutando diagnóstico...</p>
        
        <h3>Verificando variables de entorno:</h3>
        {envStatus && Object.entries(envStatus).map(([key, details]: [string, any]) => (
          <div key={key}>
            <span style={{ color: details.defined ? '#4ade80' : '#f87171' }}>
              {key}: {details.value} {details.defined ? '✅' : '❌'}
            </span>
          </div>
        ))}
        
        <h3>Verificando localStorage:</h3>
        <div>
          Total de claves: {(() => {
            try {
              return Object.keys(localStorage).length;
            } catch (e) {
              return 'No accesible';
            }
          })()}
        </div>
        
        <h3>Información del navegador:</h3>
        <div>
          User Agent: {navigator.userAgent}
        </div>
        <div>
          Online: <span style={{ color: navigator.onLine ? '#4ade80' : '#f87171' }}>
            {navigator.onLine ? '✅ Conectado' : '❌ Desconectado'}
          </span>
        </div>
        
        <h3>Información detallada de variables de entorno:</h3>
        {envDetails && (
          <pre style={{ fontSize: '12px' }}>
            {JSON.stringify(envDetails, null, 2)}
          </pre>
        )}
        
        <div>Diagnóstico completado</div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Configurar variables de entorno manualmente:</h3>
        <p>Si las variables de entorno no están siendo cargadas automáticamente, puedes configurarlas manualmente aquí:</p>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            URL de Supabase:
          </label>
          <input 
            type="text" 
            value={customUrl} 
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://your-project.supabase.co"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Clave Anónima de Supabase:
          </label>
          <input 
            type="text" 
            value={customKey} 
            onChange={(e) => setCustomKey(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        <button 
          onClick={handleLoadVariables}
          disabled={loading}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Cargando...' : 'Aplicar Variables'}
        </button>
        
        {message && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            borderRadius: '4px'
          }}>
            {message.text}
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Solución de problemas:</h3>
        <ol style={{ lineHeight: '1.6' }}>
          <li>
            <strong>Comprueba que el archivo .env.local existe</strong> en la raíz del proyecto 
            y contiene las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
          </li>
          <li>
            Reinicie el servidor de desarrollo (<code>npm run dev</code>) para aplicar los cambios del archivo .env.
          </li>
          <li>
            Alternativamente, puede configurar las variables manualmente usando el formulario anterior
            (solo para sesión actual, se perderán al recargar).
          </li>
          <li>
            <strong>IMPORTANTE:</strong> Asegúrese de que este componente <strong>NO SE INCLUYA</strong> en 
            compilaciones de producción.
          </li>
        </ol>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          borderTop: '1px solid #555', 
          fontSize: '12px',
          color: '#888'
        }}>
          Versión de diagnóstico v1.1 - Modo: {import.meta.env.MODE}
        </div>
      </div>
    </div>
  );
}