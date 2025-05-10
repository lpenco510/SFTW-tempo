import React, { useEffect, useState, Suspense, lazy, Component, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CalendarRange, RefreshCw, BarChart2, LineChart } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

// Lazy load components to improve initial load performance
const SummaryWidgets = lazy(() => import("@/components/dashboard/SummaryWidgets"));
const QuickActions = lazy(() => import("@/components/dashboard/QuickActions")); 
const ActivityTable = lazy(() => import("@/components/dashboard/ActivityTable"));

// Interfaces para los props de ErrorBoundary
interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Implementación personalizada de ErrorBoundary
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error capturado en ErrorBoundary:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <this.props.FallbackComponent 
        error={this.state.error!} 
        resetErrorBoundary={() => this.setState({ hasError: false, error: null })}
      />;
    }

    return this.props.children;
  }
}

// Componente fallback para errores de carga
function ErrorFallback({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary: () => void; 
}) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center text-red-800">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Error en el Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-700">Se ha producido un error al cargar el dashboard: {error.message}</p>
        <p className="mt-2">Por favor, refresca la página o contacta con soporte si el problema persiste.</p>
        <Button 
          onClick={resetErrorBoundary} 
          className="mt-4"
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
        </Button>
      </CardContent>
    </Card>
  );
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 rounded-lg w-full"></div>
  </div>
);

// Nuevo componente para Análisis
const AnalyticsDashboard = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" />
          Envíos por Región
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-muted-foreground">Datos de gráfico en desarrollo</p>
      </div>
      </CardContent>
    </Card>
    
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center">
          <LineChart className="h-5 w-5 mr-2" />
          Análisis de Tendencias
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-muted-foreground">Datos de gráfico en desarrollo</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function Home() {
  const { currentCompany } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  useEffect(() => {
    // Agregar un manejador global de errores para capturar problemas en tiempo de ejecución
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Error global capturado:", event.error);
      setHasError(true);
      setErrorMessage(event.error?.message || "Error desconocido en el dashboard");
      event.preventDefault(); // Prevenir comportamiento por defecto
    };
    
    window.addEventListener('error', handleGlobalError);
    
    // Simulate loading with delay for better UX but with a MAXIMUM timeout
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    // Seguridad adicional: forzar finalización de carga después de máximo 5 segundos
    const maxLoadingTimer = setTimeout(() => {
      if (isLoading) {
        console.log("Forzando finalización de carga después de tiempo máximo");
        setIsLoading(false);
      }
    }, 5000);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      clearTimeout(timer);
      clearTimeout(maxLoadingTimer);
    };
  }, [isLoading]);
  
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-800">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Error al cargar el dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">Se ha producido un error: {errorMessage}</p>
          <p className="mt-2">Por favor, refresca la página o contacta con soporte si el problema persiste.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Recargar la página
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleError = (error: Error) => {
    console.error("Error capturado en el dashboard:", error);
    setHasError(true);
    setErrorMessage(error.message);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido, {currentCompany?.nombre || "Usuario"}. Aquí tienes un resumen de tu actividad.
          </p>
          </div>
        <div className="flex items-center gap-2">
          <Card className="w-auto flex items-center gap-2 px-4 py-2 bg-primary/5 border-none">
            <CalendarRange className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString("es-AR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 h-11">
          <TabsTrigger value="overview" className="text-sm">Vista General</TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm">Análisis</TabsTrigger>
          <TabsTrigger value="activity" className="text-sm">Actividad</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8 pt-2">
          <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
            <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-6">
              <React.Suspense fallback={<LoadingFallback />}>
                <div className="xl:col-span-3 lg:col-span-2">
                  <SummaryWidgets />
                </div>

                <div className="space-y-6">
                  <QuickActions />
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Estado del Sistema</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-1">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm">Despachos pendientes</span>
                        <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm">Documentación</span>
                        <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm">Tracking de envíos</span>
                        <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm">Gestión aduanera</span>
                        <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </React.Suspense>
            </div>
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="analytics" className="pt-2">
          <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
            <Suspense fallback={<LoadingFallback />}>
              <AnalyticsDashboard />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="activity" className="pt-2">
          <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
            <Suspense fallback={<LoadingFallback />}>
              <ActivityTable />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
