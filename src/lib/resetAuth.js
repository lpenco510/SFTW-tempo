/**
 * Script para resetear el estado de autenticación y resolver problemas
 * de sesiones inconsistentes o estados corruptos.
 * 
 * Ejecutar este script en la consola del navegador si:
 * - Estás atrapado en un bucle de redirección
 * - La sesión no cierra correctamente
 * - Cualquier otro comportamiento extraño relacionado con la autenticación
 * 
 * Uso: copiar y pegar este código en la consola del navegador (F12).
 */

(function resetAuth() {
  console.log('🧹 Iniciando limpieza de autenticación...');
  
  // 1. Limpiar datos relacionados a la autenticación en localStorage
  const authKeys = [
    'isGuestUser',
    'cachedUserData',
    'companyContext',
    'lastVisitedRoute',
    'guestUser',
    'sb-bfzwvshxtfryawcvqwyu-auth-token',
    'supabase-auth-token'
  ];
  
  console.log('🔑 Eliminando claves de autenticación en localStorage...');
  authKeys.forEach(key => {
    try {
      if (localStorage.getItem(key)) {
        console.log(`✅ Eliminando ${key}`);
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`❌ Error al eliminar ${key}:`, error);
    }
  });
  
  // 2. Limpiar datos en sessionStorage
  console.log('🔑 Eliminando claves de autenticación en sessionStorage...');
  authKeys.forEach(key => {
    try {
      if (sessionStorage.getItem(key)) {
        console.log(`✅ Eliminando ${key} de sessionStorage`);
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`❌ Error al eliminar ${key} de sessionStorage:`, error);
    }
  });
  
  // 3. Limpiar cookies relacionadas a autenticación
  console.log('🍪 Eliminando cookies de autenticación...');
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.trim().split('=')[0];
    if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
      console.log(`✅ Eliminando cookie ${name}`);
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
  
  // 4. Información adicional para el usuario
  console.log('✨ Limpieza completa.');
  console.log('📋 Recomendaciones:');
  console.log('1. Recargar la página (F5 o Ctrl+R)');
  console.log('2. Si el problema persiste, cerrar completamente el navegador y volver a abrirlo');
  console.log('3. En caso de continuar con problemas, borrar el caché del navegador');
  
  return '✅ Proceso de limpieza de autenticación completado. Recargar la página.';
})(); 