import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Database 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ConnectionStatus = "checking" | "connected" | "error" | "offline";

interface SupabaseStatusProps {
  polling?: boolean;
  pollingInterval?: number;
  showRefresh?: boolean;
  compact?: boolean;
  className?: string;
}

export default function SupabaseStatus({
  polling = false,
  pollingInterval = 60000,
  showRefresh = true,
  compact = false,
  className = ""
}: SupabaseStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    setStatus("checking");
    
    try {
      if (Date.now() - lastCheck.getTime() < 5000) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const { error } = await supabase.from("companies").select("id").limit(1);
        
      if (error) {
        console.error("Error al verificar conexión a Supabase:", error);
        setStatus("error");
        setErrorMessage(error.message);
      } else {
        setStatus("connected");
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error inesperado al verificar conexión:", error);
      setStatus("offline");
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsChecking(false);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    const initialCheckTimeout = setTimeout(() => {
      checkConnection();
    }, 1000);
    
    let pollingInterval: number | undefined;
    if (polling) {
      pollingInterval = window.setInterval(checkConnection, pollingInterval);
    }
    
    return () => {
      clearTimeout(initialCheckTimeout);
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [polling, pollingInterval]);

  // Información a mostrar según el estado
  const getStatusInfo = () => {
    switch (status) {
      case "connected":
        return {
          icon: <CheckCircle2 className={compact ? "h-4 w-4" : "h-5 w-5"} />,
          text: "Conectado",
          variant: "default" as const,
          color: "text-green-500"
        };
      case "error":
        return {
          icon: <XCircle className={compact ? "h-4 w-4" : "h-5 w-5"} />,
          text: "Error",
          variant: "destructive" as const,
          color: "text-red-500"
        };
      case "offline":
        return {
          icon: <AlertCircle className={compact ? "h-4 w-4" : "h-5 w-5"} />,
          text: "Sin conexión",
          variant: "outline" as const,
          color: "text-yellow-500"
        };
      default:
        return {
          icon: <Database className={`animate-pulse ${compact ? "h-4 w-4" : "h-5 w-5"}`} />,
          text: "Verificando",
          variant: "secondary" as const,
          color: "text-slate-500"
        };
    }
  };

  const { icon, text, variant, color } = getStatusInfo();
  
  // Renderizado compacto (solo icono con tooltip)
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`cursor-help flex items-center ${className}`}>
              <span className={color}>{icon}</span>
              {showRefresh && status !== "checking" && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 ml-1" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    checkConnection();
                  }}
                  disabled={isChecking}
                >
                  <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Verificar conexión</span>
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs">
              <p className="font-medium">Estado de Supabase: {text}</p>
              {errorMessage && <p className="text-red-500 mt-1">{errorMessage}</p>}
              <p className="text-muted-foreground mt-1">
                Última verificación: {lastCheck.toLocaleTimeString()}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Renderizado completo (badge con texto e icono)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={variant} className="flex items-center gap-1 py-1 h-7">
        {icon}
        <span>Supabase: {text}</span>
      </Badge>
      
      {showRefresh && status !== "checking" && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          onClick={checkConnection}
          disabled={isChecking}
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          <span className="sr-only">Verificar conexión</span>
        </Button>
      )}
      
      {errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
} 