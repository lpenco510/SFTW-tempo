/**
 * Herramientas de diagnóstico y reinicio de autenticación
 * Para resolver problemas de sesión y autenticación en IT CARGO
 * 
 * Este script puede ser ejecutado desde la consola del navegador para:
 * 1. Identificar problemas de autenticación
 * 2. Limpiar datos de sesión corruptos
 * 3. Reiniciar el estado de la aplicación
 */

// Herramientas de diagnóstico para problemas de autenticación

/**
 * Diagnostica problemas de autenticación
 */
window.diagnoseAuthIssues = async function() {
  console.log('🔍 Iniciando diagnóstico completo del sistema de autenticación...');
  
  // Revisar variables de entorno
  console.log('\n📋 Verificando variables de entorno:');
  // Accedemos a las variables desde window en lugar de import.meta
  const supabaseUrl = window.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = window.VITE_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL no está definida');
  } else {
    console.log('✅ VITE_SUPABASE_URL está definida:', supabaseUrl);
  }
  
  if (!supabaseAnonKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY no está definida');
  } else {
    console.log('✅ VITE_SUPABASE_ANON_KEY está definida (valor oculto por seguridad)');
  }
  
  // Revisar el localStorage
  console.log('\n📋 Verificando localStorage:');
  try {
    const keys = Object.keys(localStorage);
    console.log('Claves en localStorage:', keys);
    
    // Buscar claves relacionadas con autenticación
    const authKeys = keys.filter(key => 
      key.includes('supabase') || 
      key.includes('auth') || 
      key.includes('user') || 
      key.includes('guest')
    );
    
    if (authKeys.length > 0) {
      console.log('🔑 Claves de autenticación encontradas:', authKeys);
      
      // Mostrar información de cada clave (sin mostrar tokens completos)
      authKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value && value.length > 100) {
            console.log(`- ${key}: ${value.substring(0, 20)}...${value.substring(value.length - 20)} (${value.length} caracteres)`);
          } else {
            console.log(`- ${key}: ${value}`);
          }
        } catch (e) {
          console.error(`- Error al leer ${key}:`, e);
        }
      });
    } else {
      console.warn('⚠️ No se encontraron claves de autenticación en localStorage');
    }
  } catch (e) {
    console.error('❌ Error al acceder a localStorage:', e);
  }
  
  // Verificar conexión a Supabase
  console.log('\n📋 Verificando conexión a Supabase:');
  try {
    // No podemos usar imports dinámicos en la consola, así que usamos el objeto global
    const supabase = window.supabaseClient;
    if (!supabase) {
      console.error('❌ Cliente Supabase no disponible globalmente');
      console.log('Intente ejecutar este script después de que la aplicación se haya cargado completamente');
      return;
    }
    
    const startTime = Date.now();
    const { data, error } = await supabase.auth.getSession();
    const endTime = Date.now();
    
    if (error) {
      console.error('❌ Error al verificar sesión:', error);
    } else {
      console.log(`✅ Conexión a Supabase OK (${endTime - startTime}ms)`);
      console.log('Sesión actual:', data?.session ? 'Activa' : 'Inactiva');
    }
  } catch (e) {
    console.error('❌ Error al acceder a supabase:', e);
  }
  
  // Verificar rutas de autenticación
  console.log('\n📋 Verificando rutas de autenticación:');
  try {
    const currentPath = window.location.pathname;
    console.log('Ruta actual:', currentPath);
    
    const lastRoute = localStorage.getItem('lastVisitedRoute');
    console.log('Última ruta visitada:', lastRoute || 'No guardada');
  } catch (e) {
    console.error('❌ Error al verificar rutas:', e);
  }
  
  // Verificar estado de navegador
  console.log('\n📋 Información del navegador:');
  console.log('User Agent:', navigator.userAgent);
  console.log('Cookies habilitadas:', navigator.cookieEnabled);
  console.log('Online:', navigator.onLine);
  
  console.log('\n✅ Diagnóstico completo.');
  
  return {
    supabaseConfig: {
      urlDefined: !!supabaseUrl,
      keyDefined: !!supabaseAnonKey
    },
    storage: {
      available: typeof localStorage !== 'undefined',
      authKeysFound: Object.keys(localStorage || {}).some(key => 
        key.includes('supabase') || 
        key.includes('auth') || 
        key.includes('user')
      )
    }
  };
};

/**
 * Reinicia el estado de autenticación
 */
window.resetAuth = function() {
  console.log('🧹 Limpiando datos de autenticación...');
  
  // Limpiar localStorage
  try {
    const keys = Object.keys(localStorage);
    const authKeys = keys.filter(key => 
      key.includes('supabase') || 
      key.includes('auth') || 
      key.includes('user') || 
      key.includes('guest')
    );
    
    console.log('Eliminando claves:', authKeys);
    authKeys.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Datos de autenticación limpiados correctamente');
    console.log('🔄 Recargando página en 2 segundos...');
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  } catch (e) {
    console.error('❌ Error al limpiar datos:', e);
  }
};

/**
 * Reparación rápida para problemas comunes
 */
window.quickFix = function() {
  console.log('🔧 Aplicando reparación rápida...');
  
  try {
    // 1. Eliminar sesiones expiradas o corruptas
    const keys = Object.keys(localStorage);
    const supabaseKeys = keys.filter(key => key.includes('supabase'));
    supabaseKeys.forEach(key => localStorage.removeItem(key));
    
    // 2. Eliminar datos de usuario invitado
    localStorage.removeItem('guest_user');
    localStorage.removeItem('guestUser');
    
    // 3. Restablecer última ruta
    localStorage.setItem('lastVisitedRoute', '/dashboard');
    
    console.log('✅ Reparación rápida aplicada');
    console.log('🔄 Recargando página...');
    
    // 4. Recargar para aplicar cambios
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  } catch (e) {
    console.error('❌ Error durante la reparación:', e);
  }
};

/**
 * Chequeo de estado general
 */
window.checkSystemStatus = async function() {
  console.log('🏥 Verificando estado del sistema...');
  
  // 1. Verificar conexión a internet
  const online = navigator.onLine;
  console.log('Conexión a internet:', online ? '✅ Conectado' : '❌ Desconectado');
  
  if (!online) {
    console.error('❌ Sin conexión a internet. Conéctate y vuelve a intentarlo.');
    return;
  }
  
  // 2. Verificar Supabase
  try {
    // Usar cliente global en lugar de import
    const supabase = window.supabaseClient;
    if (!supabase) {
      console.error('❌ Cliente Supabase no disponible');
      return;
    }
    
    // Intentar una operación básica
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Error al comunicarse con Supabase:', error);
    } else {
      console.log('✅ Comunicación con Supabase OK');
    }
  } catch (e) {
    console.error('❌ Error al verificar Supabase:', e);
  }
  
  // 3. Verificar si hay modo oscuro/claro correcto
  const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  console.log('Tema preferido:', darkMode ? 'Oscuro' : 'Claro');
  
  console.log('✅ Verificación completa');
};

/**
 * Exponer el cliente Supabase globalmente para diagnóstico
 */
window.exposeSupabaseClient = function() {
  try {
    // Buscar en el estado de React si existe
    const reactRoot = document.querySelector('[data-reactroot]');
    if (reactRoot && reactRoot._reactRootContainer) {
      console.log('Buscando cliente Supabase en el estado de React...');
      // Esto es una aproximación y puede no funcionar en todas las versiones de React
    }
    
    console.log('Para exponer correctamente el cliente Supabase, ejecute lo siguiente en su código:');
    console.log('window.supabaseClient = supabase; // Añadir en src/lib/supabase.ts');
  } catch (e) {
    console.error('Error al intentar exponer el cliente Supabase:', e);
  }
};

console.log('🛠️ Herramientas de diagnóstico cargadas. Use los siguientes comandos en la consola:');
console.log('   • diagnoseAuthIssues() - Diagnosticar problemas de autenticación');
console.log('   • resetAuth() - Reiniciar autenticación completamente');
console.log('   • quickFix() - Aplicar una reparación rápida');
console.log('   • checkSystemStatus() - Verificar estado general del sistema');
console.log('   • exposeSupabaseClient() - Instrucciones para exponer el cliente Supabase'); 