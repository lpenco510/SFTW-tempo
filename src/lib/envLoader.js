/**
 * Cargador manual de variables de entorno para desarrollo
 * 
 * Este script se utiliza en entornos de desarrollo para facilitar
 * la carga manual de variables de entorno cuando existen problemas
 * con la carga automática mediante Vite.
 */

/**
 * Utility for handling environment variables
 * Only exposed in development mode for debugging purposes
 */

// Default environment variables for development use only
const defaultEnvVariables = {
  VITE_SUPABASE_URL: 'https://your-supabase-project.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'your-supabase-anon-key'
};

// Mejorar logging para depuración
const log = {
  info: (message) => console.log(`[EnvLoader] 📋 ${message}`),
  warn: (message) => console.warn(`[EnvLoader] ⚠️ ${message}`),
  error: (message) => console.error(`[EnvLoader] ❌ ${message}`),
  success: (message) => console.log(`[EnvLoader] ✅ ${message}`),
  debug: (message) => console.debug(`[EnvLoader] 🔍 ${message}`)
};

/**
 * Busca variables de entorno en múltiples fuentes
 * @param {string} key - Nombre de la variable
 * @returns {string|undefined} - Valor de la variable o undefined
 */
function searchVariable(key) {
  let sources = [];
  
  // Buscar en import.meta.env (prioridad 1)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[key];
    if (value) {
      sources.push({ source: 'import.meta.env', value });
    }
  }
  
  // Buscar en window (prioridad 2)
  if (typeof window !== 'undefined' && window[key]) {
    sources.push({ source: 'window', value: window[key] });
  }
  
  // Buscar en localStorage (prioridad 3)
  try {
    if (typeof localStorage !== 'undefined') {
      const localStorageKey = `debug_${key.toLowerCase()}`;
      const value = localStorage.getItem(localStorageKey);
      if (value) {
        sources.push({ source: 'localStorage', value });
      }
    }
  } catch (e) {
    log.warn(`No se pudo acceder a localStorage: ${e.message}`);
  }
  
  // Buscar en process.env (solo para entornos Node, prioridad 4)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    sources.push({ source: 'process.env', value: process.env[key] });
  }
  
  // Usar la primera fuente encontrada
  if (sources.length > 0) {
    log.debug(`Variable ${key} encontrada en: ${sources[0].source}`);
    return sources[0].value;
  }
  
  return undefined;
}

/**
 * Check if environment variables are loaded correctly
 * @returns {Object} Status of environment variables
 */
export function checkEnvVariables() {
  const supabaseUrl = searchVariable('VITE_SUPABASE_URL');
  const supabaseAnonKey = searchVariable('VITE_SUPABASE_ANON_KEY');
  
  log.info(`Estado de variables de entorno - URL: ${supabaseUrl ? 'Disponible' : 'No disponible'}, Key: ${supabaseAnonKey ? 'Disponible' : 'No disponible'}`);
  
  return {
    VITE_SUPABASE_URL: {
      defined: !!supabaseUrl,
      value: supabaseUrl ? 'Configurada' : 'No definida'
    },
    VITE_SUPABASE_ANON_KEY: {
      defined: !!supabaseAnonKey,
      value: supabaseAnonKey ? 'Configurada' : 'No definida'
    }
  };
}

/**
 * Load environment variables manually for development
 * @param {Object} variables - Key-value pairs of environment variables to set
 * @returns {Object} Status of loaded variables
 */
export function loadEnvVariables(variables = {}) {
  if (import.meta.env.PROD) {
    log.warn('loadEnvVariables debe usarse solo en desarrollo');
    return { success: false, message: 'Solo disponible en desarrollo' };
  }
  
  // Add variables to window for development use
  if (typeof window !== 'undefined') {
    // Configurar variables en window
    window.VITE_SUPABASE_URL = variables.VITE_SUPABASE_URL || searchVariable('VITE_SUPABASE_URL') || defaultEnvVariables.VITE_SUPABASE_URL;
    window.VITE_SUPABASE_ANON_KEY = variables.VITE_SUPABASE_ANON_KEY || searchVariable('VITE_SUPABASE_ANON_KEY') || defaultEnvVariables.VITE_SUPABASE_ANON_KEY;
    
    // Guardar en localStorage para persistencia entre recargas
    try {
      localStorage.setItem('debug_vite_supabase_url', window.VITE_SUPABASE_URL);
      localStorage.setItem('debug_vite_supabase_anon_key', window.VITE_SUPABASE_ANON_KEY);
      log.success('Variables guardadas en localStorage para persistencia');
    } catch (e) {
      log.warn(`No se pudo guardar en localStorage: ${e.message}`);
    }
    
    // Actualizar import.meta.env si es posible (algunas implementaciones de Vite lo permiten)
    try {
      if (import.meta.env && typeof import.meta.env === 'object') {
        // Algunos entornos permiten esto, otros no
        import.meta.env.VITE_SUPABASE_URL = window.VITE_SUPABASE_URL;
        import.meta.env.VITE_SUPABASE_ANON_KEY = window.VITE_SUPABASE_ANON_KEY;
        log.success('Variables actualizadas en import.meta.env');
      }
    } catch (e) {
      log.warn(`No se pudo actualizar import.meta.env: ${e.message}`);
    }
    
    log.success('Variables de entorno cargadas manualmente');
    
    // Enviar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('env-variables-changed', {
      detail: {
        VITE_SUPABASE_URL: window.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: 'Configurada (valor oculto)'
      }
    }));
    
    return { 
      success: true, 
      loaded: {
        VITE_SUPABASE_URL: window.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: 'Configurada (valor oculto)'
      }
    };
  }
  
  return { success: false, message: 'No se pudo acceder a window' };
}

/**
 * Clear manually loaded environment variables
 */
export function clearEnvVariables() {
  if (typeof window !== 'undefined') {
    // Limpiar window
    delete window.VITE_SUPABASE_URL;
    delete window.VITE_SUPABASE_ANON_KEY;
    
    // Limpiar localStorage
    try {
      localStorage.removeItem('debug_vite_supabase_url');
      localStorage.removeItem('debug_vite_supabase_anon_key');
      log.success('Variables eliminadas de localStorage');
    } catch (e) {
      log.warn(`No se pudo acceder a localStorage: ${e.message}`);
    }
    
    log.success('Variables de entorno eliminadas');
    
    // Enviar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('env-variables-changed', {
      detail: { cleared: true }
    }));
    
    return { success: true };
  }
  
  return { success: false, message: 'No se pudo acceder a window' };
}

// Cargar variables automáticamente en desarrollo al importar
export function autoLoadEnvVariables() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    // No sobrescribir si ya están definidas
    if (!window.VITE_SUPABASE_URL || !window.VITE_SUPABASE_ANON_KEY) {
      // Intentar cargar desde localStorage primero
      const urlFromStorage = localStorage.getItem('debug_vite_supabase_url');
      const keyFromStorage = localStorage.getItem('debug_vite_supabase_anon_key');
      
      // Si están en localStorage, cargarlas
      if (urlFromStorage && keyFromStorage) {
        log.info('Cargando variables desde localStorage');
        loadEnvVariables({
          VITE_SUPABASE_URL: urlFromStorage,
          VITE_SUPABASE_ANON_KEY: keyFromStorage
        });
      }
    }
  }
}

// Expose functions in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.envLoader = {
    check: checkEnvVariables,
    load: loadEnvVariables,
    clear: clearEnvVariables,
    search: searchVariable,
    autoLoad: autoLoadEnvVariables
  };
  
  // Intentar cargar automáticamente al iniciar
  autoLoadEnvVariables();
}

// Información sobre las funciones disponibles
log.info('Herramientas de variables de entorno cargadas. Funciones disponibles:');
log.info('   • loadEnvVariables() - Cargar variables de entorno manualmente');
log.info('   • clearEnvVariables() - Borrar variables de entorno');
log.info('   • checkEnvVariables() - Verificar estado de variables');
log.info('\nEjemplo de uso:');
log.info('loadEnvVariables({ VITE_SUPABASE_URL: "https://tu-proyecto.supabase.co", VITE_SUPABASE_ANON_KEY: "tu-clave-anon" })');