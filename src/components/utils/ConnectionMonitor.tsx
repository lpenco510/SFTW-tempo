import React, { useEffect, useState, useRef } from 'react';
import { getConnectionStatus, checkConnection, startConnectionMonitor } from '@/lib/supabase';
import { AlertTriangle, CheckCircle, RefreshCw, WifiOff } from 'lucide-react';

type ConnectionMonitorProps = {
  showStatus?: boolean;
  interval?: number;
};

const ConnectionMonitor: React.FC<ConnectionMonitorProps> = ({ 
  showStatus = false, 
  interval = 120000 // Increased from 30000 to 120000 to reduce API calls
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const monitorRef = useRef<() => void | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reduce el número de verificaciones de conexión para usuarios autenticados
  const hasActiveUser = () => {
    try {
      return !!(localStorage.getItem('sb-user') || localStorage.getItem('guest_user'));
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    // Empezar con un estado "desconocido" (null)
    setIsConnected(null);
    
    // Verificación inicial solo si no tenemos usuario activo o ha pasado tiempo
    const lastCheck = parseInt(sessionStorage.getItem('last_connection_check') || '0');
    const now = Date.now();
    
    // Increase cache time to 5 minutes for connection checks
    if (!hasActiveUser() || now - lastCheck > 300000) {
      // Add delay on initial connection check to allow other critical resources to load first
      setTimeout(() => {
        checkConnection().then(connected => {
          setIsConnected(connected);
          sessionStorage.setItem('last_connection_check', now.toString());
          setLastCheckTime(now);
        });
      }, 2000);
    } else {
      // Si hay usuario activo y se verificó recientemente, asumir conectado
      setIsConnected(true);
      setLastCheckTime(lastCheck);
    }
    
    // Iniciar monitor con intervalo más largo para usuarios autenticados
    const monitorInterval = hasActiveUser() ? Math.max(interval, 300000) : interval;
    
    // Iniciar el monitor si no estaba iniciado
    if (!monitorRef.current) {
      monitorRef.current = startConnectionMonitor(monitorInterval);
    }
    
    // Suscribirse a eventos de conexión
    const handleConnectionOk = () => {
      setIsConnected(true);
      setLastCheckTime(Date.now());
      setIsVisible(false);
      
      // Ocultar automáticamente después de un tiempo
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    
    const handleConnectionError = () => {
      setIsConnected(false);
      setLastCheckTime(Date.now());
      setIsVisible(true);
    };
    
    window.addEventListener('supabase-connection-ok', handleConnectionOk);
    window.addEventListener('supabase-connection-error', handleConnectionError);
    
    return () => {
      window.removeEventListener('supabase-connection-ok', handleConnectionOk);
      window.removeEventListener('supabase-connection-error', handleConnectionError);
      
      // Detener el monitor al desmontar
      if (monitorRef.current) {
        monitorRef.current();
        monitorRef.current = null;
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [interval]);
  
  // Si no queremos mostrar el estado o estamos conectados, no mostrar nada
  if (!showStatus || !isVisible || isConnected === true) {
    return null;
  }
  
  // Solo mostrar indicador cuando hay problema de conexión confirmado
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-3 max-w-xs">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${
          isConnected === null ? 'bg-gray-400' : 
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <div className="text-sm">
          <p className="font-medium">
            {isConnected === null ? 'Verificando conexión...' : 
             isConnected ? 'Conectado' : 'Problema de conexión'}
          </p>
          {!isConnected && (
            <p className="text-xs text-gray-600">
              La aplicación está intentando reconectar.
            </p>
          )}
        </div>
        <button 
          className="ml-2 text-gray-500 hover:text-gray-700"
          onClick={async () => {
            // Prevent multiple rapid clicks
            if (Date.now() - lastCheckTime < 3000) return;
            
            const connected = await checkConnection();
            setIsConnected(connected);
            setLastCheckTime(Date.now());
            if (connected) {
              setIsVisible(false);
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ConnectionMonitor; 