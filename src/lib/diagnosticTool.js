/**
 * Herramienta de diagnóstico para IT CARGO
 * 
 * Esta herramienta ayuda a diagnosticar problemas comunes en la aplicación
 * y proporciona información útil para la depuración.
 */

window.runDiagnostics = async function() {
  console.clear();
  console.log('🔍 IT CARGO - Iniciando diagnóstico completo del sistema...');

  // 1. Verificar variables de entorno
  console.log('\n📋 VARIABLES DE ENTORNO:');
  
  // Intentar obtener variables desde diferentes fuentes
  let supabaseUrl = window.VITE_SUPABASE_URL;
  let supabaseKey = window.VITE_SUPABASE_ANON_KEY;
  
  // Si no están disponibles en window, verificar otras alternativas (para desarrollo)
  if (!supabaseUrl || !supabaseKey) {
    try {
      // En algunos entornos podrían estar disponibles como parte de process.env
      if (typeof process !== 'undefined' && process.env) {
        supabaseUrl = supabaseUrl || process.env.VITE_SUPABASE_URL;
        supabaseKey = supabaseKey || process.env.VITE_SUPABASE_ANON_KEY;
      }
      
      // Verificar si están en localStorage (sólo para pruebas)
      const localStorageUrl = localStorage.getItem('debug_supabase_url');
      const localStorageKey = localStorage.getItem('debug_supabase_key');
      
      if (localStorageUrl && !supabaseUrl) {
        supabaseUrl = localStorageUrl;
        console.log('Se encontró URL de Supabase en localStorage (no recomendado para producción)');
      }
      
      if (localStorageKey && !supabaseKey) {
        supabaseKey = localStorageKey;
        console.log('Se encontró clave de Supabase en localStorage (no recomendado para producción)');
      }
    } catch (e) {
      console.error('Error al intentar acceder a fuentes alternativas de variables de entorno:', e);
    }
  }
  
  const envVars = {
    supabaseUrl: supabaseUrl || '❌ No definida',
    supabaseKey: supabaseKey ? '✅ Definida (oculta)' : '❌ No definida',
  };
  console.table(envVars);

  // Sugerencia para resolver problemas de variables de entorno
  if (!supabaseUrl || !supabaseKey) {
    console.warn('\n⚠️ SOLUCIÓN PARA VARIABLES DE ENTORNO:');
    console.log('Para solucionar problemas con las variables de entorno, intenta:');
    console.log('1. Verificar que el archivo .env.local existe en la raíz del proyecto');
    console.log('2. Asegurarte que las variables comienzan con VITE_');
    console.log('3. Reiniciar el servidor de desarrollo');
    console.log('4. Como solución temporal para pruebas, puedes configurarlas manualmente:');
    console.log('   localStorage.setItem("debug_supabase_url", "https://tu-proyecto.supabase.co")');
    console.log('   localStorage.setItem("debug_supabase_key", "tu-clave-anon")');
  }

  // 2. Verificar errores de JavaScript
  console.log('\n📋 ERRORES EN CONSOLA:');
  if (window.consoleErrors && window.consoleErrors.length > 0) {
    console.log(`Se encontraron ${window.consoleErrors.length} errores:`);
    window.consoleErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.message}`);
    });
  } else {
    console.log('✅ No se han capturado errores JavaScript (solo desde que se cargó esta herramienta)');
  }

  // 3. Verificar localStorage
  console.log('\n📋 ESTADO DE LOCALSTORAGE:');
  try {
    const keys = Object.keys(localStorage);
    const authKeys = keys.filter(key => 
      key.includes('supabase') || 
      key.includes('auth') || 
      key.includes('user') || 
      key.includes('guest')
    );
    
    console.log(`Total de claves: ${keys.length}`);
    console.log(`Claves de autenticación: ${authKeys.length}`);
    
    if (authKeys.length > 0) {
      console.log('Datos de autenticación encontrados:');
      authKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value && value.length > 100) {
          console.log(`- ${key}: ${value.substring(0, 20)}...${value.substring(value.length - 20)} (${value.length} caracteres)`);
        } else {
          console.log(`- ${key}: ${value}`);
        }
      });
    }
  } catch (e) {
    console.error('❌ Error al acceder a localStorage:', e);
  }

  // 4. Verificar estado de Supabase
  console.log('\n📋 ESTADO DE SUPABASE:');
  const supabase = window.supabaseClient;
  if (!supabase) {
    console.error('❌ Cliente Supabase no disponible globalmente');
  } else {
    console.log('✅ Cliente Supabase disponible');
    
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const endTime = Date.now();
      
      console.log(`Tiempo de respuesta: ${endTime - startTime}ms`);
      
      if (error) {
        console.error('❌ Error al verificar sesión:', error);
      } else {
        console.log('✅ Comunicación con Supabase OK');
        console.log('Sesión:', data?.session ? 'Activa' : 'No hay sesión activa');
      }
    } catch (e) {
      console.error('❌ Error al verificar sesión de Supabase:', e);
    }
  }

  // 5. Verificar elementos React
  console.log('\n📋 ESTADO DE REACT:');
  const reactElements = document.querySelectorAll('[data-reactroot]');
  if (reactElements.length === 0) {
    console.warn('⚠️ No se detectaron elementos React montados en la página');
  } else {
    console.log(`✅ Elementos React montados: ${reactElements.length}`);
  }

  // 6. Verificar carga de recursos
  console.log('\n📋 RECURSOS DE LA PÁGINA:');
  const resources = performance.getEntriesByType('resource');
  const failedResources = resources.filter(r => r.transferSize === 0 && r.decodedBodySize === 0);
  
  if (failedResources.length > 0) {
    console.warn(`⚠️ ${failedResources.length} recursos pueden haber fallado al cargar:`);
    failedResources.forEach(r => console.log(`- ${r.name}`));
  } else {
    console.log(`✅ ${resources.length} recursos cargados correctamente`);
  }

  // 7. Verificar resolución de rutas
  console.log('\n📋 INFORMACIÓN DE RUTAS:');
  console.log('URL actual:', window.location.href);
  console.log('Pathname:', window.location.pathname);
  console.log('Última ruta guardada:', localStorage.getItem('lastVisitedRoute') || 'No guardada');

  // 8. Monitoreo de red para solucionar problemas de CORS o recursos
  console.log('\n📋 VERIFICANDO PROBLEMAS DE RED:');
  try {
    const networkEntries = performance.getEntriesByType('resource');
    const apiCalls = networkEntries.filter(entry => 
      entry.name.includes('supabase') || 
      entry.name.includes('api')
    );
    
    if (apiCalls.length > 0) {
      console.log(`Se encontraron ${apiCalls.length} llamadas a API:`);
      apiCalls.forEach(call => {
        console.log(`- ${call.name} (${call.duration.toFixed(2)}ms)`);
      });
    } else {
      console.log('No se detectaron llamadas a APIs');
    }
  } catch (e) {
    console.error('Error al verificar red:', e);
  }

  // 9. Análisis de rendimiento
  console.log('\n📋 MÉTRICAS DE RENDIMIENTO:');
  try {
    const pageLoad = performance.getEntriesByType('navigation')[0];
    if (pageLoad) {
      console.log(`Tiempo total de carga: ${pageLoad.duration.toFixed(2)}ms`);
      console.log(`DOM Content Loaded: ${pageLoad.domContentLoadedEventEnd.toFixed(2)}ms`);
      console.log(`First Paint: ${performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime.toFixed(2) || 'No disponible'}ms`);
    }
  } catch (e) {
    console.error('Error al obtener métricas de rendimiento:', e);
  }

  // 10. Verificar compatibilidad de navegador
  console.log('\n📋 COMPATIBILIDAD DE NAVEGADOR:');
  console.log('User Agent:', navigator.userAgent);
  console.log('Cookies habilitadas:', navigator.cookieEnabled);
  console.log('Online:', navigator.onLine);
  console.log('Servicios Workers:', 'serviceWorker' in navigator ? 'Soportados' : 'No soportados');
  console.log('IndexedDB:', window.indexedDB ? 'Soportada' : 'No soportada');
  console.log('LocalStorage:', typeof localStorage !== 'undefined' ? 'Soportado' : 'No soportado');

  console.log('\n✅ Diagnóstico completo del sistema.');
  
  return {
    environment: envVars,
    hasSupabaseClient: !!window.supabaseClient,
    hasSession: !!(window.supabaseClient && await window.supabaseClient.auth.getSession().then(res => res.data?.session)),
    browserCompatibility: {
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled,
      localStorage: typeof localStorage !== 'undefined'
    }
  };
};

// Capturar errores para el diagnóstico
window.consoleErrors = [];
const originalConsoleError = console.error;
console.error = function(...args) {
  window.consoleErrors.push({
    message: args.join(' '),
    timestamp: new Date().toISOString()
  });
  originalConsoleError.apply(console, args);
};

// Ayuda sobre cómo usar la herramienta
window.diagnosticHelp = function() {
  console.log('🛠️ Herramientas de diagnóstico para IT CARGO:');
  console.log('   • runDiagnostics() - Ejecutar diagnóstico completo del sistema');
  console.log('   • resetAuth() - Limpiar datos de autenticación y reiniciar');
  console.log('   • manualInitSupabase() - Asistente para inicializar Supabase manualmente (desarrollo)');
  console.log('   • diagnosticHelp() - Mostrar esta ayuda');
  console.log('   • exposeSupabaseErrors() - Mostrar más detalles sobre errores de Supabase');
  console.log('\nHerramientas de configuración manual:');
  console.log('   • localStorage.setItem("debug_supabase_url", "https://tu-proyecto.supabase.co")');
  console.log('   • localStorage.setItem("debug_supabase_key", "tu-clave-anon")');
  console.log('\nEjemplo de uso: runDiagnostics().then(results => console.log(results))');
};

// Función para habilitar errores más detallados en Supabase 
window.exposeSupabaseErrors = function() {
  if (window.supabaseClient) {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0].toString();
      if (url.includes('supabase')) {
        console.log(`🔍 Fetch a Supabase: ${url}`);
        return originalFetch.apply(this, args)
          .then(response => {
            if (!response.ok) {
              response.clone().text().then(text => {
                try {
                  const errorJson = JSON.parse(text);
                  console.error('❌ Error de Supabase:', errorJson);
                } catch (e) {
                  console.error('❌ Error de Supabase (texto):', text);
                }
              });
            }
            return response;
          });
      }
      return originalFetch.apply(this, args);
    };
    console.log('✅ Monitoreo detallado de errores Supabase activado');
  } else {
    console.error('❌ Cliente Supabase no disponible');
  }
};

// Función para inicializar manualmente el cliente Supabase (solución temporal de desarrollo)
window.manualInitSupabase = async function() {
  if (window.supabaseClient) {
    console.log('El cliente Supabase ya está inicializado');
    return window.supabaseClient;
  }
  
  try {
    // Verificar si la URL y la clave están guardadas en localStorage
    let url = localStorage.getItem('debug_supabase_url');
    let key = localStorage.getItem('debug_supabase_key');
    
    // Si no están en localStorage, preguntar al usuario
    if (!url || !key) {
      console.log('Se necesita la URL y clave anon de Supabase para inicializar manualmente');
      
      const defaultUrl = 'https://bfzwvshxtfryawcvqwyu.supabase.co';
      url = url || defaultUrl;
      
      console.log(`URL: ${url}`);
      console.log('Para continuar, se necesita la clave anon');
      console.log('Puedes encontrarla en el archivo .env.local');
      console.log('O ejecuta este comando para guardarla temporalmente:');
      console.log('localStorage.setItem("debug_supabase_key", "tu-clave-anon-aquí")');
      
      return null;
    }
    
    // Intentar cargar la librería de Supabase
    console.log('Intentando cargar la librería Supabase...');
    
    // Mostrar instrucciones para inicialización manual
    console.log('✅ Datos disponibles para inicialización manual');
    console.log('Para inicializar manualmente, pega en la consola:');
    console.log(`
    (async function() {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.26.0/+esm');
      window.supabaseClient = createClient(
        '${url}',
        '${key}',
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true
          }
        }
      );
      console.log('Cliente Supabase inicializado manualmente');
      return window.supabaseClient;
    })()
    `);
    
    return null;
  } catch (e) {
    console.error('Error al intentar inicializar manualmente Supabase:', e);
    return null;
  }
};

// Inicializar la herramienta
console.log('🛠️ Herramientas de diagnóstico cargadas. Use runDiagnostics() para iniciar el diagnóstico completo.');
diagnosticHelp(); 