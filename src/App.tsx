import { Suspense, useEffect, useState, useRef } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import AyudaPage from "./components/ayuda/AyudaPage";
import FeedbackPage from "./components/feedback/FeedbackPage";
import ConfiguracionPage from "./components/configuracion/ConfiguracionPage";
import LiquidacionIVAPage from "./components/finanzas/LiquidacionIVAPage";
import AnalisisPage from "./components/finanzas/AnalisisPage";
import ReportesPage from "./components/finanzas/ReportesPage";
import Home from "./components/home";
import ProductosPage from "./components/productos/ProductosPage";
import RegimenGeneralPage from "./components/comex/RegimenGeneralPage";
import CourierPage from "./components/comex/CourierPage";
import ExportacionesPage from "./components/comex/ExportacionesPage";
import AduanasPage from "./components/comex/AduanasPage";
import TrackingPage from "./components/comex/TrackingPage";
import TarifasPage from "./components/comex/TarifasPage";
import InventarioPage from "./components/inventario/InventarioPage";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
// Importar AuthProvider directamente desde useAuth.tsx
import { AuthProvider } from "./hooks/useAuth"; 
// Importar useAuth con llaves {} desde useAuth (que lo re-exporta)
import { useAuth } from "./hooks/useAuth";
import { supabase, checkConnection } from "./lib/supabase";
import { isGuestUser, LAST_ROUTE_KEY } from "./lib/auth";
import ConnectionMonitor from "./components/utils/ConnectionMonitor";
import { useLoadingStatus } from "./hooks/useLoadingStatus";
import { EnvDiagnostics } from './components/diagnostics/EnvDiagnostics';

// Componente para mostrar errores de conexión
const ConnectionErrorBanner = ({ onRetry }: { onRetry: () => void }) => (
  <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 flex justify-between items-center z-50">
    <span>
      <strong>Error de conexión:</strong> No podemos conectar con el servidor. 
      Revisa tu conexión a internet.
    </span>
    <button 
      onClick={onRetry}
      className="px-3 py-1 bg-white text-red-500 rounded-md hover:bg-red-100 text-sm font-bold"
    >
      Reintentar
    </button>
  </div>
);

function RedirectBasedOnAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const [hasChecked, setHasChecked] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    // Solo ejecutar una vez por ruta para evitar múltiples chequeos
    if (hasChecked || isProcessing) {
      return;
    }
    
    const checkAuth = async () => {
      setIsProcessing(true);
      console.log(`[RedirectBasedOnAuth] Verificando autenticación para ruta: ${pathname}`);
      
      // Si ya estamos en login o register, no hacemos nada
      if (pathname === '/login' || pathname === '/register') {
        console.log('[RedirectBasedOnAuth] En página de login o registro, no se requiere redirección');
        setHasChecked(true);
        setIsProcessing(false);
        return;
      }
      
      try {
        // Primero verificar si es usuario invitado (es más rápido)
        const guestStatus = await isGuestUser();
        
        if (guestStatus) {
          console.log("[RedirectBasedOnAuth] Usuario invitado detectado, permitiendo acceso a:", pathname);
          setHasChecked(true);
          setIsProcessing(false);
          return;
        }
        
        // Verificar si hay una sesión activa
        console.log('[RedirectBasedOnAuth] Verificando sesión en Supabase');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[RedirectBasedOnAuth] Error al obtener sesión:', sessionError);
          if (checkAttempts < 2) {
            setCheckAttempts(prev => prev + 1);
            setHasChecked(false); // Intentar de nuevo
            setIsProcessing(false);
            return;
          }
        }
        
        console.log("[RedirectBasedOnAuth] Estado de sesión:", !!session ? "Activa" : "Inactiva");
        
        // Si no hay sesión y no es usuario invitado, redirigir al login
        if (!session) {
          console.log("[RedirectBasedOnAuth] No hay sesión activa. Redirigiendo a /login");
          
          // Guardar la ruta actual antes de redirigir
          try {
            localStorage.setItem('lastVisitedRoute', pathname);
            console.log('[RedirectBasedOnAuth] Ruta guardada para redirección después del login:', pathname);
          } catch (storageError) {
            console.error('[RedirectBasedOnAuth] Error al guardar lastVisitedRoute:', storageError);
          }
          
          // Redirigir al login
          navigate('/login', { replace: true });
        } else {
          console.log("[RedirectBasedOnAuth] Sesión verificada, permitiendo acceso a:", pathname);
        }
        
        setHasChecked(true);
        setIsProcessing(false);
      } catch (error) {
        console.error("[RedirectBasedOnAuth] Error crítico verificando autenticación:", error);
        
        // Si hay un error, intentar hasta 3 veces
        if (checkAttempts < 2) {
          console.log(`[RedirectBasedOnAuth] Reintentando verificación (intento ${checkAttempts + 1}/3)`);
          setCheckAttempts(prev => prev + 1);
          setHasChecked(false);
          setIsProcessing(false);
        } else {
          console.error('[RedirectBasedOnAuth] Demasiados intentos fallidos, redirigiendo a login');
          navigate('/login', { replace: true });
          setHasChecked(true);
          setIsProcessing(false);
        }
      }
    };
    
    // Pequeño retraso para dar tiempo a que se inicialice la autenticación
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timer);
    
  }, [navigate, pathname, hasChecked, checkAttempts, isProcessing]);
  
  // Reiniciar hasChecked cuando cambia la ruta
  useEffect(() => {
    setHasChecked(false);
    setCheckAttempts(0);
    setIsProcessing(false);
    console.log('[RedirectBasedOnAuth] Cambio de ruta detectado, reiniciando verificación para:', pathname);
  }, [pathname]);
  
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [initialLoad, setInitialLoad] = useState(true);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const userVerifiedRef = useRef(false);

  useEffect(() => {
    // Si ya verificamos al usuario con éxito una vez, no mostrar pantalla de carga de nuevo
    if (userVerifiedRef.current && user) {
      setInitialLoad(false);
      return;
    }

    // Guardar la última ruta visitada para redirigir después del login
    if (user) {
      localStorage.setItem('lastRoute', location.pathname);
      userVerifiedRef.current = true;
    }
    
    // Dar un tiempo para que se cargue todo correctamente
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 500);
    
    // Agregar un timeout de seguridad para evitar espera infinita
    const loadMaxTimer = setTimeout(() => {
      if (loading) {
        console.warn('ProtectedRoute: Timeout de seguridad activado, forzando finalización de carga');
        setLoadTimeout(true);
      }
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(loadMaxTimer);
    };
  }, [location.pathname, user, loading]);

  // Si está cargando pero no se ha superado el timeout de seguridad
  // Y no es una recarga de página para un usuario ya autenticado
  if ((loading || initialLoad) && !loadTimeout && !userVerifiedRef.current) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Verificando acceso...</p>
          <p className="text-sm text-gray-500 mt-2">
            {loadTimeout ? 'Esto está tomando más tiempo del esperado...' : ''}
          </p>
        </div>
      </div>
    );
  }

  // Si se activó el timeout de seguridad y no hay usuario, redirigir al login
  if (loadTimeout && !user) {
    console.error('ProtectedRoute: Timeout activado y no hay usuario, redirigiendo a login');
    return <Navigate to="/login" />;
  }

  // Si no hay usuario después de cargar, redirigir al login
  if (!user) {
    console.log('ProtectedRoute: No hay usuario autenticado, redirigiendo a login');
    return <Navigate to="/login" />;
  }

  // Si hay usuario, permitir acceso a la ruta protegida
  if (!userVerifiedRef.current) {
    console.log('ProtectedRoute: Usuario autenticado, permitiendo acceso');
    userVerifiedRef.current = true;
  }
  return <>{children}</>;
}

function App() {
  const { isLoading, isConnected, hasTimedOut } = useLoadingStatus();
  const [globalError, setGlobalError] = useState<Error | null>(null);
  
  // Monitor global de errores
  useEffect(() => {
    // Manejo de errores global
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Error global detectado:', event.error || event);
      setGlobalError(event.error || new Error('Error desconocido en la aplicación'));
      event.preventDefault();
    };
    
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      console.error('Promesa rechazada no manejada:', event.reason);
      setGlobalError(event.reason instanceof Error ? event.reason : new Error('Error asíncrono no manejado'));
      event.preventDefault();
    };
    
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

  // IMPORTANTE: Advertencia de producción para herramientas de diagnóstico
  useEffect(() => {
    if (import.meta.env.PROD) {
      console.warn('⚠️ RECORDATORIO IMPORTANTE: Asegúrese de eliminar la herramienta de diagnóstico antes de la implementación en producción.');
    }
  }, []);
  
  // Componente de carga mejorado con estado
  const LoadingScreen = () => (
    <div className="loading-overlay">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md text-center">
        <img
          src="/IT CARGO - GLOBAL - toditos-17.png"
          alt="IT CARGO"
          className="h-24 mx-auto mb-6 loading-bounce"
        />
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-lg font-medium mt-4 text-gray-600 dark:text-gray-300">
          {hasTimedOut ? "Finalizando carga..." : "Cargando aplicación..."}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {isConnected === false ? "Problemas de conexión detectados" : "Estableciendo conexión segura"}
        </p>
      </div>
    </div>
  );
  
  // Componente para mostrar errores globales
  const ErrorScreen = ({ error }: { error: Error }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 border border-red-100">
        <div className="flex items-center text-red-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold">Error en la aplicación</h2>
        </div>
        <p className="mb-4 text-gray-700">{error.message || 'Se ha producido un error inesperado.'}</p>
        <p className="mb-6 text-gray-500 text-sm">Por favor, intenta recargar la página. Si el problema persiste, contacta con soporte.</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          Recargar aplicación
        </button>
      </div>
    </div>
  );
  
  // Check if environment variables are properly configured using all possible ways
  const getEnvVar = (name: string): string | undefined => {
    // Try import.meta.env first (standard way)
    if (import.meta.env[name]) return import.meta.env[name];
    
    // Try window object (might be set by debug tools)
    if (typeof window !== 'undefined' && (window as any)[name]) 
      return (window as any)[name];
    
    // Try process.env (available in some setups)
    if (typeof process !== 'undefined' && process.env && process.env[name]) 
      return process.env[name];
    
    return undefined;
  };
  
  const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
  const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
  
  // ELIMINANDO COMPLETAMENTE LA VALIDACIÓN DE VARIABLES DE ENTORNO
  // para evitar que se muestre el diagnóstico y forzar la carga de la aplicación
  
  // Si hay un error global, mostrar pantalla de error
  if (globalError) {
    return <ErrorScreen error={globalError} />;
  }
  
  return (
    <AuthProvider>
      <RedirectBasedOnAuth />
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Suspense fallback={<LoadingScreen />}>
          <div className="min-h-screen bg-background">
            {/* Banner de error de conexión */}
            {isConnected === false && (
              <ConnectionErrorBanner 
                onRetry={async () => {
                  const connected = await checkConnection();
                }} 
              />
            )}
            
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Home />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/productos"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ProductosPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comex/general"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <RegimenGeneralPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comex/courier"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <CourierPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comex/exports"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ExportacionesPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comex/aduanas"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AduanasPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comex/tracking"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TrackingPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comex/tarifas"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TarifasPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finanzas/iva"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <LiquidacionIVAPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finanzas/analisis"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AnalisisPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finanzas/reportes"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ReportesPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventario"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <InventarioPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ayuda"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AyudaPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feedback"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <FeedbackPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracion"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ConfiguracionPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              {/* Ruta para redireccionar cualquier ruta no definida */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Monitor de conexión */}
            <ConnectionMonitor showStatus={true} interval={30000} />
          </div>
        </Suspense>
      )}
    </AuthProvider>
  );
}

export default App;
