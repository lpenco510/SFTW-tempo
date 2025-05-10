import { useState, useEffect, useRef } from 'react';
import { supabase, getConnectionStatus, checkConnection } from '@/lib/supabase';

/**
 * Hook para gestionar estados de carga y monitorear la conexión con Supabase
 */
export function useLoadingStatus(monitorConnection = true) {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [lastConnectionCheck, setLastConnectionCheck] = useState<number>(0);
  const keepaliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para verificar la conexión
  const verifyConnection = async (force = false) => {
    // No realizar verificaciones repetitivas a menos que se fuerce
    const now = Date.now();
    if (!force && now - lastConnectionCheck < 30000) {
      return;
    }

    try {
      const connected = await checkConnection();
      setIsConnected(connected);
      setLastConnectionCheck(now);
      
      if (!connected) {
        setConnectionError(new Error('No se pudo establecer conexión con Supabase'));
      } else {
        setConnectionError(null);
      }
      
      return connected;
    } catch (error) {
      console.error('Error verificando conexión:', error);
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error : new Error('Error desconocido'));
      return false;
    }
  };

  // Inicializar el estado de carga y conexión
  useEffect(() => {
    setIsLoading(true);
    
    // Add a small delay before the initial connection check to prioritize UI rendering
    const initialDelay = setTimeout(() => {
      // Verificar conexión inicial
      verifyConnection();
    }, 800);
    
    // Establecer un timeout para la carga, para evitar bloqueo indefinido
    const loadingTimer = setTimeout(() => {
      if (isLoading) {
        console.warn('Tiempo de carga excedido, mostrando UI de todas formas');
        setHasTimedOut(true);
        setIsLoading(false);
      }
    }, 5000);
    
    loadingTimeoutRef.current = loadingTimer;
    
    // Configurar intervalo de keepalive para mantener la conexión activa
    if (monitorConnection) {
      const keepaliveInterval = setInterval(() => {
        // Comprobar si hay actividad reciente del usuario
        const isUserInteracting = sessionStorage.getItem('last_user_activity');
        const lastActivity = isUserInteracting ? parseInt(isUserInteracting, 10) : 0;
        const currentTime = Date.now();
        
        // Solo enviar keepalive si ha habido actividad reciente (últimos 10 minutos)
        if (currentTime - lastActivity < 10 * 60 * 1000) {
          // Avoid unnecessary keepalive calls if there's a recent connection check
          if (currentTime - lastConnectionCheck > 120000) {
            // Enviar ping para mantener la conexión activa
            supabase.functions.invoke('keepalive', {
              body: { timestamp: Date.now() }
            }).catch(() => {
              // Silenciar errores para el keepalive, solo es para mantener conexión
            });
          }
        }
      }, 8 * 60 * 1000);
      
      keepaliveIntervalRef.current = keepaliveInterval;
    }
    
    // Establecer controlador de eventos para actividad del usuario
    const handleUserActivity = () => {
      sessionStorage.setItem('last_user_activity', Date.now().toString());
    };
    
    // Monitorear eventos de usuario para detectar actividad - use throttled events
    let lastActivityUpdate = 0;
    const throttledActivity = () => {
      const now = Date.now();
      if (now - lastActivityUpdate > 60000) {
        lastActivityUpdate = now;
        handleUserActivity();
      }
    };
    
    window.addEventListener('click', throttledActivity);
    window.addEventListener('keypress', throttledActivity);
    
    // Inicializar el timestamp de actividad
    handleUserActivity();
    
    // Escuchar eventos de cambio de estado de conexión
    const handleConnectionChange = () => {
      const status = getConnectionStatus();
      setIsConnected(status.isConnected);
      setConnectionError(status.lastError);
    };
    
    window.addEventListener('supabase-connection-ok', handleConnectionChange);
    window.addEventListener('supabase-connection-error', handleConnectionChange);
    
    // Detectar cuando la página vuelve a estar activa
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Add a small delay before checking connection on tab focus
        connectionCheckTimeoutRef.current = setTimeout(() => {
          // Verificar conexión inmediatamente cuando la página vuelve a estar visible
          verifyConnection(true);
          handleUserActivity();
        }, 1000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // Limpiar todos los timers e intervalos
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (keepaliveIntervalRef.current) clearInterval(keepaliveIntervalRef.current);
      if (connectionCheckTimeoutRef.current) clearTimeout(connectionCheckTimeoutRef.current);
      clearTimeout(initialDelay);
      
      // Remover listeners
      window.removeEventListener('click', throttledActivity);
      window.removeEventListener('keypress', throttledActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('supabase-connection-ok', handleConnectionChange);
      window.removeEventListener('supabase-connection-error', handleConnectionChange);
    };
  }, [monitorConnection]);
  
  // Efecto para finalizar la carga cuando se establece la conexión
  useEffect(() => {
    if (isConnected === true && isLoading) {
      // Si la conexión está establecida, finalizar la carga
      setIsLoading(false);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  }, [isConnected, isLoading]);
  
  return {
    isLoading,
    isConnected,
    connectionError,
    hasTimedOut,
    verifyConnection
  };
}