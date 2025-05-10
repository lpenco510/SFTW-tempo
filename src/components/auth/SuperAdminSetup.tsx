import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, AlertTriangle, Eye, EyeOff, Key } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { generateSecurePassword } from '@/lib/security';

const PASSWORD_MIN_LENGTH = 16;

/**
 * Componente para configurar un usuario SuperAdmin con control total del sistema
 * Solo accesible en entorno de desarrollo o con claves especiales
 */
const SuperAdminSetup: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>(generateSecurePassword());
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [securityKey, setSecurityKey] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [agreeSecurityPolicy, setAgreeSecurityPolicy] = useState<boolean>(false);
  const [agreeAuditLogging, setAgreeAuditLogging] = useState<boolean>(false);
  const [agreeTwoFactor, setAgreeTwoFactor] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Validación de seguridad básica
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password.length >= PASSWORD_MIN_LENGTH && 
    /[A-Z]/.test(password) && 
    /[a-z]/.test(password) && 
    /[0-9]/.test(password) && 
    /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password === confirmPassword;
  const isSecurityKeyValid = securityKey === process.env.NEXT_PUBLIC_SETUP_KEY || process.env.NODE_ENV === 'development';
  
  const allChecksValid = isValidEmail && 
    isValidPassword && 
    passwordsMatch && 
    fullName.length > 3 && 
    agreeSecurityPolicy && 
    agreeAuditLogging && 
    agreeTwoFactor &&
    isSecurityKeyValid;
  
  const toggleShowPassword = () => setShowPassword(!showPassword);
  
  const generateNewPassword = () => {
    const newPassword = generateSecurePassword();
    setPassword(newPassword);
    setConfirmPassword(newPassword);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allChecksValid) {
      setError('Por favor, complete todos los campos correctamente y acepte las condiciones.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Crear usuario con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw new Error(authError.message);
      
      // 2. Crear registro en profiles con rol superadmin
      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            role: 'superadmin',
            is_verified: true
          })
          .eq('id', authData.user.id);
        
        if (profileError) throw new Error(profileError.message);
        
        // 3. Registrar creación en auditoría
        const { error: auditError } = await supabase
          .from('audit_logs')
          .insert({
            table_name: 'profiles',
            record_id: authData.user.id,
            operation: 'SUPERADMIN_CREATION',
            new_data: { email, full_name: fullName, role: 'superadmin' },
            user_id: authData.user.id
          });
        
        if (auditError) throw new Error(auditError.message);
        
        setSuccess(true);
      } else {
        throw new Error('No se pudo crear el usuario');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al configurar SuperAdmin');
      console.error('Error al configurar SuperAdmin:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center bg-green-50">
          <CardTitle className="flex items-center justify-center gap-2 text-green-700">
            <Shield className="h-5 w-5" />
            SuperAdmin Configurado
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-3">
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertTitle className="text-green-800">Usuario SuperAdmin creado con éxito</AlertTitle>
            <AlertDescription className="mt-2 text-green-700">
              Se ha creado un usuario con privilegios de SuperAdmin. Por favor guarde esta información en un lugar seguro:
            </AlertDescription>
          </Alert>
          
          <div className="rounded-md bg-slate-50 p-3 border mb-4">
            <p className="mb-2"><strong>Email:</strong> {email}</p>
            <p className="mb-0"><strong>Contraseña:</strong> {showPassword ? password : '••••••••••••••••'}</p>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={toggleShowPassword}>
              {showPassword ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPassword ? 'Ocultar' : 'Mostrar'} contraseña
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <p className="text-sm text-red-700 font-medium">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            Esta información no se mostrará nuevamente por motivos de seguridad.
          </p>
          <Button className="w-full" onClick={() => window.location.href = '/auth/login'}>
            Ir a Iniciar Sesión
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center bg-slate-50 border-b">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-amber-600" />
          Configuración de SuperAdmin
        </CardTitle>
        <CardDescription>
          Configure un usuario con control absoluto del sistema
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <Alert variant="destructive" className="mb-4 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-amber-800">Acceso Restringido</AlertTitle>
            <AlertDescription className="mt-1 text-amber-700">
              Esta configuración solo debe realizarse una única vez por personal autorizado.
              Todas las acciones quedarán registradas en el sistema de auditoría.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="securityKey">Clave de Seguridad</Label>
            <div className="flex">
              <Input
                id="securityKey"
                type={showPassword ? "text" : "password"}
                value={securityKey}
                onChange={(e) => setSecurityKey(e.target.value)}
                className="flex-1"
                placeholder="Introduzca la clave de seguridad del sistema"
                required
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="ml-2"
                onClick={toggleShowPassword}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {!isSecurityKeyValid && securityKey && (
              <p className="text-sm text-red-500 mt-1">Clave de seguridad incorrecta</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="superadmin@empresa.com"
              required
            />
            {email && !isValidEmail && (
              <p className="text-sm text-red-500 mt-1">Email inválido</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre y Apellido"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="password">Contraseña</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={generateNewPassword}
              >
                <Key className="h-3 w-3 mr-1" />
                Generar
              </Button>
            </div>
            <div className="flex">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1"
                required
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="ml-2"
                onClick={toggleShowPassword}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {password && !isValidPassword && (
              <p className="text-sm text-red-500 mt-1">
                La contraseña debe tener al menos {PASSWORD_MIN_LENGTH} caracteres e incluir mayúsculas, 
                minúsculas, números y símbolos
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-sm text-red-500 mt-1">Las contraseñas no coinciden</p>
            )}
          </div>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="securityPolicy" 
                checked={agreeSecurityPolicy}
                onCheckedChange={(checked) => setAgreeSecurityPolicy(checked === true)}
              />
              <Label htmlFor="securityPolicy" className="text-sm">
                Acepto implementar políticas de seguridad estrictas y mantener la confidencialidad de acceso
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="auditLogging" 
                checked={agreeAuditLogging}
                onCheckedChange={(checked) => setAgreeAuditLogging(checked === true)}
              />
              <Label htmlFor="auditLogging" className="text-sm">
                Entiendo que todas mis acciones serán registradas en el sistema de auditoría
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="twoFactor" 
                checked={agreeTwoFactor}
                onCheckedChange={(checked) => setAgreeTwoFactor(checked === true)}
              />
              <Label htmlFor="twoFactor" className="text-sm">
                Me comprometo a configurar autenticación de dos factores tras el primer inicio de sesión
              </Label>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={!allChecksValid || loading}>
            {loading ? 'Configurando...' : 'Configurar SuperAdmin'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SuperAdminSetup; 