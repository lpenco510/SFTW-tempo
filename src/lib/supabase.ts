import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Obtención de Variables de Entorno ---
const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[supabase.ts] Intentando inicializar Supabase...');
console.log(`[supabase.ts] VITE_SUPABASE_URL: ${supabaseUrl ? 'Definida' : '*** INDEFINIDA ***'}`);
console.log(`[supabase.ts] VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Definida' : '*** INDEFINIDA ***'}`);

// --- Validación y Creación del Cliente ---
let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[supabase.ts] ¡ERROR CRÍTICO! Las variables de entorno de Supabase no están definidas.');
  // Lanzar un error aquí detendría la ejecución, lo cual es bueno para detectar el problema temprano.
  throw new Error('Las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están configuradas correctamente.');
  // Si prefieres que la app intente continuar (aunque probablemente falle después), comenta el throw y descomenta la siguiente línea:
  // supabase = {} as SupabaseClient; // Cliente vacío para evitar error de TS, pero la app fallará
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[supabase.ts] Cliente Supabase creado ¡ÉXITO!');
  } catch (error) {
    console.error('[supabase.ts] ¡ERROR CRÍTICO! Falló la creación del cliente Supabase:', error);
    throw new Error('No se pudo crear el cliente de Supabase.');
  }
}

// --- Función para limpiar caché de consultas ---
// Esta función es necesaria y se importa en useAuth.tsx
export const clearQueryCache = () => {
  console.log('[supabase.ts] Limpiando caché de consultas...');
  try {
    // Si hay una implementación específica para limpiar caché, irá aquí
    // Por ahora, es solo un stub que registra la acción
    console.log('[supabase.ts] Caché de consultas limpiada.');
  } catch (error) {
    console.error('[supabase.ts] Error al limpiar caché de consultas:', error);
  }
};

// --- Estado de conexión global ---
// Esta variable mantiene el último estado de conexión conocido
let connectionStatus: { connected: boolean; lastCheck: number; error?: any } = {
  connected: false,
  lastCheck: 0,
};

// --- Obtener estado de conexión ---
// Esta función es importada en ConnectionMonitor.tsx y useLoadingStatus.ts
export const getConnectionStatus = () => {
  return {
    ...connectionStatus,
    isConnected: connectionStatus.connected,
    lastError: connectionStatus.error,
    isStale: Date.now() - connectionStatus.lastCheck > 30000
  };
};

// --- Iniciar monitor de conexión ---
// Esta función es importada en ConnectionMonitor.tsx
export const startConnectionMonitor = (intervalMs: number = 30000) => {
  console.log(`[supabase.ts] Iniciando monitor de conexión (intervalo: ${intervalMs}ms)`);
  
  // Esta es una forma segura de evitar múltiples intervalos si la función se llama varias veces
  if ((window as any).__connectionMonitorInterval) {
    clearInterval((window as any).__connectionMonitorInterval);
  }
  
  // Realizar una comprobación inicial
  checkConnection().then(result => {
    connectionStatus = {
      connected: result.connected,
      lastCheck: Date.now(),
      error: result.error
    };
  });
  
  // Configurar el intervalo de comprobación
  (window as any).__connectionMonitorInterval = setInterval(async () => {
    try {
      console.log('[supabase.ts] Realizando comprobación periódica de conexión...');
      const result = await checkConnection();
      connectionStatus = {
        connected: result.connected,
        lastCheck: Date.now(),
        error: result.error
      };
    } catch (error) {
      console.error('[supabase.ts] Error durante la comprobación periódica:', error);
      connectionStatus = {
        connected: false,
        lastCheck: Date.now(),
        error
      };
    }
  }, intervalMs);
  
  // Retornamos una función para detener el monitor si es necesario
  return () => {
    if ((window as any).__connectionMonitorInterval) {
      clearInterval((window as any).__connectionMonitorInterval);
      (window as any).__connectionMonitorInterval = null;
      console.log('[supabase.ts] Monitor de conexión detenido.');
    }
  };
};

// --- Obtener columnas de una tabla ---
// Esta función es importada en AuthProvider.tsx
export const getTableColumns = async (tableName: string) => {
  console.log(`[supabase.ts] Obteniendo columnas para tabla: ${tableName}`);
  try {
    // Esta es una implementación genérica que podría funcionar para la mayoría de bases de datos
    // Si Supabase tiene una API específica para esto, debería usarse esa
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', tableName);
    
    if (error) {
      console.error(`[supabase.ts] Error al obtener columnas para ${tableName}:`, error);
      return { columns: [], error };
    }
    
    console.log(`[supabase.ts] Columnas obtenidas para ${tableName}:`, data);
    return { columns: data || [], error: null };
  } catch (err) {
    console.error(`[supabase.ts] Excepción al obtener columnas para ${tableName}:`, err);
    return { columns: [], error: err };
  }
};

// --- Exportación del Cliente ---
export { supabase };

// --- Función de Verificación de Conexión ---
export const checkConnection = async (): Promise<{ connected: boolean; error?: any; data?: any }> => {
  console.log('[supabase.ts] Iniciando verificación de conexión con Supabase...');
  if (!supabase || Object.keys(supabase).length === 0) {
    console.warn('[supabase.ts] Verificación de conexión omitida: el cliente Supabase no está inicializado.');
    return { connected: false, error: 'Cliente Supabase no inicializado' };
  }
  try {
    // Usamos una consulta simple y específica que no debería fallar si hay conexión
    // Cambia 'profiles' por una tabla pública real si 'profiles' requiere autenticación
    const { data, error, status } = await supabase
      .from('companies') // Consultamos 'companies' (plural) que es la tabla correcta
      .select('id')
      .limit(1);

    if (error && status !== 406) { // 406 puede ser normal si la tabla está vacía o RLS lo impide sin auth
      console.error('[supabase.ts] Error en la verificación de conexión Supabase:', error);
      return { connected: false, error };
    }
    
    if (status === 401) { // Error específico de autenticación (clave inválida?)
        console.error('[supabase.ts] Error 401: Problema de autenticación con Supabase (¿API Key incorrecta?).');
        return { connected: false, error: 'Error de autenticación (API Key inválida?)' };
    }

    console.log('[supabase.ts] Verificación de conexión Supabase ¡ÉXITO!');
    return { connected: true, data };
  } catch (err) {
    console.error('[supabase.ts] Excepción durante la verificación de conexión Supabase:', err);
    return { connected: false, error: err };
  }
};
