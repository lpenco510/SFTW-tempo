import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useAuth from "@/hooks/useAuth";
import { Link } from "react-router-dom";

// Esquema de validación optimizado
const formSchema = z.object({
  email: z.string()
    .min(1, {
      message: "El correo electrónico es obligatorio",
    })
    .email({
      message: "El correo electrónico debe tener un formato válido",
    }),
  password: z.string()
    .min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
  rememberMe: z.boolean().optional(),
});

// Componente completo de formulario de invitado separado para evitar conflictos de contexto
function GuestLoginForm({ onSubmit, isSubmitting, error }) {
  const [companyName, setCompanyName] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (companyName.trim()) {
      onSubmit(companyName);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="companyName" className="text-sm font-medium">
          Nombre de la Empresa
        </label>
        <Input
          id="companyName"
          placeholder="Ingresa el nombre de tu empresa"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando...
          </>
        ) : (
          "Continuar como Invitado"
        )}
      </Button>
    </form>
  );
}

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const mountedRef = useRef(false);
  
  const { signIn, useGuestMode, getLastRoute } = useAuth();
  const navigate = useNavigate();

  // Optimización: Inicializar valores por defecto desde localStorage si existen
  const defaultEmail = localStorage.getItem("remembered_email") || "";
  const defaultRememberMe = !!localStorage.getItem("remembered_email");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: defaultEmail,
      password: "",
      rememberMe: defaultRememberMe,
    },
  });

  useEffect(() => {
    // Evitar efectos duplicados en modo estricto
    if (mountedRef.current) return;
    mountedRef.current = true;
    
    // Comprobar si hay un token en la URL (por ejemplo, después de confirmar correo)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    
    if (accessToken && refreshToken) {
      console.log("Tokens encontrados en URL, redirigiendo al dashboard");
      // Redirigir al dashboard si los tokens están presentes
      navigate(getLastRoute());
    }
  }, [navigate, getLastRoute]);
  
  // Manejar inicio de sesión
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Optimización: Guardar email si "recordarme" está seleccionado
      if (values.rememberMe) {
        localStorage.setItem("remembered_email", values.email);
      } else {
        localStorage.removeItem("remembered_email");
      }
      
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        console.error("Error al iniciar sesión:", error);
        
        // Mejorar mensajes de error
        if (error.message?.includes("Invalid login")) {
          setError("Credenciales inválidas. Verifica tu correo y contraseña.");
        } else if (error.message?.includes("network")) {
          setError("Error de conexión. Verifica tu conexión a internet.");
        } else {
          setError(error.message || "Error al iniciar sesión. Inténtalo de nuevo.");
        }
        
        return;
      }
      
      // Redirigir a la última ruta visitada o al dashboard
      console.log("Inicio de sesión exitoso, redirigiendo");
      navigate(getLastRoute());
      
    } catch (err) {
      console.error("Error inesperado:", err);
      setError("Error inesperado. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Manejar modo invitado
  const handleGuestMode = async (companyName) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (!companyName.trim()) {
        setError("Por favor, introduce el nombre de tu empresa para continuar como invitado.");
        return;
      }
      
      console.log('Iniciando modo invitado con empresa:', companyName);
      
      // Primero intentar limpiar el localStorage para evitar conflictos
      try {
        localStorage.removeItem('guest_user');
      } catch (e) {
        console.warn('No se pudo limpiar localStorage:', e);
      }
      
      const result = await useGuestMode(companyName);
      
      if (result.error) {
        console.error('Error en inicio de sesión como invitado:', result.error);
        setError(typeof result.error === 'string' 
          ? result.error 
          : 'Error al iniciar sesión como invitado');
        return;
      }
      
      // Éxito - redirigir a la página principal
      console.log('Inicio de sesión como invitado exitoso, redirigiendo...');
      // Pequeña pausa para asegurar que los datos se guarden correctamente
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (error) {
      console.error('Error inesperado en modo invitado:', error);
      setError("Error inesperado al iniciar modo invitado. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Alternar entre formulario normal y modo invitado
  const toggleGuestMode = () => {
    setError(null);
    setIsGuest(!isGuest);
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {isGuest ? "Acceso como Invitado" : "Iniciar Sesión"}
        </CardTitle>
        <CardDescription className="text-center">
          {isGuest
            ? "Ingresa los datos de tu empresa para continuar"
            : "Ingresa tus credenciales para acceder"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isGuest ? (
          <GuestLoginForm 
            onSubmit={handleGuestMode} 
            isSubmitting={isSubmitting} 
            error={error} 
          />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="nombre@empresa.com" 
                        {...field} 
                        disabled={isSubmitting} 
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          disabled={isSubmitting}
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor="rememberMe"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Recordarme
                      </label>
                    </div>
                  )}
                />
                
                <Link
                  to="/reset-password"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          {isGuest ? (
            <span>
              ¿Ya tienes una cuenta?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={toggleGuestMode}>
                Iniciar sesión
              </Button>
            </span>
          ) : (
            <span>
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                Regístrate
              </Link>
              {" o "}
              <Button variant="link" className="p-0 h-auto" onClick={toggleGuestMode}>
                continuar como invitado
              </Button>
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
