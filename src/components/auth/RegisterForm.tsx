import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Lista de países con Argentina primero
const countries = [
  "Argentina",
  "Brasil",
  "Chile",
  "Colombia",
  "Ecuador",
  "España",
  "Estados Unidos",
  "México",
  "Perú",
  "Uruguay",
  "Venezuela",
  // Resto de países en orden alfabético
  "Afganistán",
  "Albania",
  "Alemania",
  "Andorra",
  // ... (más países)
];

// Lista de industrias comunes
const industries = [
  "Agricultura y ganadería",
  "Alimentación y bebidas",
  "Automotriz",
  "Comercio minorista",
  "Construcción",
  "Educación",
  "Energía",
  "Farmacéutica",
  "Finanzas y seguros",
  "Logística y transporte",
  "Manufactura",
  "Minería",
  "Salud",
  "Servicios profesionales",
  "Tecnología",
  "Telecomunicaciones",
  "Textil y moda",
  "Turismo y hostelería",
  "Otro"
];

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [identificadorFiscal, setIdentificadorFiscal] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();
  const { signUp, loading: authLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);
    setError("");

    // Validaciones básicas
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsFormLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsFormLoading(false);
      return;
    }

    try {
      const { user, error } = await signUp(
        email,
        password,
        nombreEmpresa,
        identificadorFiscal
      );

      if (error) {
        console.error("Error en registro:", error);
        setError(error.message || "Error en el registro");
      } else if (user) {
        // Registro exitoso, mostrar mensaje y redirigir después de un tiempo
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate("/login", { 
            state: { verification: true },
            replace: true 
          });
        }, 5000);
      } else {
        setError("No se pudo completar el registro");
      }
    } catch (err) {
      console.error("Error inesperado en registro:", err);
      setError("Ha ocurrido un error inesperado");
    } finally {
      setIsFormLoading(false);
    }
  };

  // Estado de carga global
  const isLoading = isFormLoading || authLoading;

  // Si el registro fue exitoso, mostrar mensaje de éxito
  if (registrationSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-center text-green-600">¡Registro Exitoso!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-lg font-medium mb-2">
                Tu cuenta ha sido creada correctamente
              </p>
              <p className="text-gray-500 mb-4">
                Hemos enviado un correo de verificación a <span className="font-medium">{email}</span>.
                Por favor, revisa tu bandeja de entrada y confirma tu correo electrónico para poder iniciar sesión.
              </p>
              <p className="text-sm text-gray-400">
                Serás redirigido a la página de inicio de sesión en unos segundos...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <div className="flex flex-col items-center mb-4">
            <img src="/IT CARGO - GLOBAL - toditos-15.png" alt="IT CARGO" className="h-16 mb-2" />
            <CardTitle>Crear Cuenta</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Nombre de la Empresa"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Identificador Fiscal (RUT/NIT)"
                value={identificadorFiscal}
                onChange={(e) => setIdentificadorFiscal(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Registrarse"
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Iniciar Sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
