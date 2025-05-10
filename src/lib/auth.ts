// Funciones de autenticación
import { supabase } from './supabase';

// Clave para guardar la última ruta visitada
export const LAST_ROUTE_KEY = 'lastVisitedRoute';

/**
 * Verifica si el usuario actual es un invitado
 * @returns {boolean} true si el usuario es invitado
 */
export function isGuestUser(): boolean {
  try {
    const guestData = localStorage.getItem("guest_user");
    if (!guestData) return false;
    
    try {
      const parsed = JSON.parse(guestData);
      // Verificar que tiene propiedades mínimas necesarias
      return !!(parsed && parsed.id && parsed.isGuest === true);
    } catch (e) {
      console.error("Error al parsear datos de invitado, eliminando datos corruptos:", e);
      localStorage.removeItem("guest_user");
      return false;
    }
  } catch (error) {
    console.error("Error al verificar usuario invitado:", error);
    return false;
  }
}

/**
 * Limpia todos los datos de autenticación del localStorage
 */
export function cleanStorage(): void {
  try {
    localStorage.removeItem("sb-token");
    localStorage.removeItem("sb-user");
    localStorage.removeItem("sb-refresh-token");
    localStorage.removeItem("guest_user");
    localStorage.removeItem(LAST_ROUTE_KEY);
    
    // Limpiar caché
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('last_connection_check');
    
    console.log("Caché y datos de autenticación limpiados correctamente");
  } catch (error) {
    console.error("Error al limpiar localStorage:", error);
  }
}

/**
 * Cierra la sesión del usuario
 */
export async function signOut(): Promise<{error: any}> {
  try {
    console.log("Iniciando proceso de cierre de sesión");
    
    // First, save any important state before logout
    try {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path && path !== '/login' && path !== '/register' && !path.startsWith('/reset-password')) {
          localStorage.setItem(LAST_ROUTE_KEY, path);
          console.log("Ruta guardada para redirección:", path);
        }
      }
    } catch (e) {
      console.error('Error al guardar última ruta:', e);
    }
    
    // Pre-emptively clean storage before supabase call to prevent stale data
    try {
      // Clear all cache and stored data
      sessionStorage.clear();
      
      // Clean critical auth items individually
      localStorage.removeItem("sb-access-token");
      localStorage.removeItem("sb-refresh-token");
      localStorage.removeItem("sb-auth-token");
      localStorage.removeItem("sb-token");
      localStorage.removeItem("sb-user");
      localStorage.removeItem("guest_user");
      localStorage.removeItem("sb-session");
      
      // Clear browser session cookies
      document.cookie = 'sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'sb-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      console.log("Storage pre-limpiado con éxito");
    } catch (clearError) {
      console.error("Error en limpieza preliminar:", clearError);
    }
    
    console.log("Llamando a Supabase Auth signOut");
    let signOutError = null;
    
    // Call supabase signOut with timeout to prevent hanging
    try {
      const signOutPromise = supabase.auth.signOut({
        scope: 'global' // Ensure all devices are signed out
      });
      
      // Set timeout to prevent hanging
      const timeoutPromise = new Promise<{error: Error}>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout durante signOut de Supabase")), 5000);
      });
      
      // Race the signOut against the timeout
      const result = await Promise.race([signOutPromise, timeoutPromise])
                               .catch(err => ({ error: err }));
      
      signOutError = result.error;
      if (signOutError) {
        console.error("Error en Supabase signOut:", signOutError);
      } else {
        console.log("Supabase signOut completado con éxito");
      }
    } catch (e) {
      console.error("Excepción en Supabase signOut:", e);
      signOutError = e;
    }
    
    // Ensure we always clean storage regardless of supabase result
    cleanStorage();
    
    // Add small delay to ensure everything is processed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Force reload after signout to completely clear state
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    
    return { error: signOutError };
  } catch (error) {
    console.error('Error global al cerrar sesión:', error);
    // Still try to clean storage even if there's an error
    try {
      cleanStorage();
    } catch (e) {
      console.error("Error en limpieza final:", e);
    }
    
    // Force reload as last resort
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    
    return { error };
  }
}

/**
 * Obtiene los datos del usuario actual
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return null;
    }
    
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single();
    
    if (userError) {
      return null;
    }
    
    return {
      ...data.session.user,
      ...userData,
      isVerified: true, // Asumimos verificado si tiene sesión
      isGuest: false
    };
  } catch (e) {
    console.error('Error al obtener usuario actual:', e);
    return null;
  }
}

/**
 * Guardar última ruta visitada
 */
export function saveLastRoute(path: string): void {
  try {
    if (path && path !== '/login' && path !== '/register' && !path.startsWith('/reset-password')) {
      localStorage.setItem(LAST_ROUTE_KEY, path);
    }
  } catch (e) {
    console.error('Error al guardar última ruta:', e);
  }
}

/**
 * Obtener última ruta visitada
 */
export function getLastRoute(): string {
  try {
    return localStorage.getItem(LAST_ROUTE_KEY) || '/dashboard';
  } catch (e) {
    console.error('Error al obtener última ruta:', e);
    return '/dashboard';
  }
}
