import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isGuestUser, cleanStorage } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface RedirectBasedOnAuthProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireVerified?: boolean;
  allowGuest?: boolean;
}

export default function RedirectBasedOnAuth({
  children,
  requireAuth = true,
  requireVerified = true,
  allowGuest = false
}: RedirectBasedOnAuthProps) {
  const { user, loading, isVerified, isPendingVerification, refreshUserData } = useAuth();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState<Error | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  // Guardar la ruta actual para redireccionar después del login
  useEffect(() => {
    if (!user && requireAuth) {
      try {
        localStorage.setItem('lastVisitedRoute', location.pathname);
        console.log("[RedirectBasedOnAuth] Guardando ruta para redirección:", location.pathname);
      } catch (error) {
        console.error("[RedirectBasedOnAuth] Error al guardar ruta:", error);
      }
    }
  }, [user, location.pathname, requireAuth]);
  
  // Forzar verificación de sesión al montar y cuando cambia la ruta
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("[RedirectBasedOnAuth] Verificando estado de sesión para ruta:", location.pathname);
        
        if (location.pathname === '/login' || location.pathname === '/register') {
          console.log("[RedirectBasedOnAuth] En página de login/register - no se requiere verificación");
          return;
        }
        
        // Obtener estado directo desde Supabase para ser definitivo
        const { data: sessionData } = await supabase.auth.getSession();
        const guest = await isGuestUser();
        
        console.log("[RedirectBasedOnAuth] Estado de sesión - Sesión:", !!sessionData.session, "Invitado:", guest);
        
        // Verificar inconsistencias
        if (sessionData.session && guest) {
          console.warn("[RedirectBasedOnAuth] Estado inconsistente: sesión activa + usuario invitado");
          
          // Limpiar storage que tendría datos inconsistentes
          cleanStorage();
          
          // Forzar recarga de datos de usuario
          await refreshUserData();
        }
      } catch (error) {
        console.error("[RedirectBasedOnAuth] Error verificando sesión:", error);
        setHasError(error instanceof Error ? error : new Error("Error verificando autenticación"));
      }
    };
    
    checkSession();
  }, [location.pathname, refreshUserData]);
  
  // Función para actualizar verificación
  const handleRefreshVerification = async () => {
    setIsRefreshing(true);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      await refreshUserData();
    } catch (error) {
      console.error("[RedirectBasedOnAuth] Error al refrescar datos:", error);
      setHasError(error instanceof Error ? error : new Error("Error actualizando verificación"));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Si hay error, mostrar pantalla de error
  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[400px]">
          <CardHeader>
            <div className="flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
              <CardTitle>Error de Autenticación</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Ha ocurrido un problema</AlertTitle>
              <AlertDescription>
                {hasError.message || "No se pudo verificar tu autenticación. Por favor, intenta de nuevo."}
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Recargar página
              </Button>
              
              <Button variant="outline" onClick={() => window.location.href = '/login'} className="w-full">
                Volver al login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pantalla de carga mientras se verifica el estado
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary rounded-full border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si requiere autenticación y no hay usuario, redirigir al login
  if (requireAuth && !user) {
    console.log("[RedirectBasedOnAuth] No hay usuario activo, redirigiendo a login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si es un usuario invitado
  const isGuest = user?.isGuest === true;
  if (requireAuth && isGuest && !allowGuest) {
    console.log("[RedirectBasedOnAuth] Usuario invitado en página protegida, redirigiendo a login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si requiere verificación y el usuario no está verificado
  if (requireAuth && requireVerified && !isVerified && !isGuest) {
    // Mostrar pantalla de verificación pendiente
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[400px]">
          <CardHeader>
            <div className="flex flex-col items-center">
              <Mail className="h-12 w-12 text-amber-500 mb-2" />
              <CardTitle>Verificación Pendiente</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="warning" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Acción requerida</AlertTitle>
              <AlertDescription className="text-amber-700">
                Por favor, verifica tu correo electrónico para continuar.
                Hemos enviado un enlace de verificación a {user?.email}.
              </AlertDescription>
            </Alert>
            
            <p className="text-sm text-muted-foreground">
              Una vez que hayas verificado tu correo, puedes actualizar esta página
              o hacer clic en el botón a continuación.
            </p>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleRefreshVerification} 
                disabled={isRefreshing}
                className="w-full"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" /> He verificado mi correo
                  </>
                )}
              </Button>
              
              {verificationAttempts > 2 && (
                <Button onClick={() => cleanStorage()} variant="ghost" className="w-full text-sm">
                  Limpiar datos de sesión
                </Button>
              )}
              
              <Button variant="outline" onClick={() => window.location.href = '/login'} className="w-full">
                Volver al login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
} 