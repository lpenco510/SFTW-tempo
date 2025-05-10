import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Check, Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useAuth from "@/hooks/useAuth";
import { useCompanySettings } from "@/hooks/useCompanySettings";

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const {
    settings,
    isLoading, 
    error, 
    isSaving,
    refreshData,
    updateCompanySettings,
    uploadLogo
  } = useCompanySettings();
  
  const [formData, setFormData] = useState({
    nombre: '',
    identificador_fiscal: '',
    direccion: '',
    telefono: '',
    email: '',
    sitio_web: '',
    pais: '',
    moneda: 'USD'
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  
  // Referencia para el timeout de carga
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Establecer un timeout para evitar la carga infinita
  useEffect(() => {
    if (isLoading && !loadingTimedOut) {
      // Si está cargando, establecer un timeout de 10 segundos
      loadingTimeoutRef.current = setTimeout(() => {
        console.log("Tiempo de carga excedido, mostrando UI de recuperación");
        setLoadingTimedOut(true);
      }, 10000); // 10 segundos
    } else if (loadingTimeoutRef.current) {
      // Limpiar el timeout si ya no está cargando
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Limpiar timeout cuando el componente se desmonta
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, loadingTimedOut]);

  // Función para recargar manualmente los datos
  const handleManualRefresh = async () => {
    try {
      console.log("Intentando recargar manualmente los datos");
      setLoadingTimedOut(false);
      await refreshData();
    } catch (err) {
      console.error("Error al recargar datos:", err);
      setErrorMessage("No se pudieron cargar los datos. Por favor, intenta nuevamente.");
    }
  };

  // Cargar datos cuando cambia la empresa
  useEffect(() => {
    if (settings) {
      setFormData({
        nombre: settings.name || settings.nombre_empresa || '',  // Usar ambos campos para compatibilidad
        identificador_fiscal: settings.tax_id || settings.rut || '',  // Usar ambos campos para compatibilidad
        direccion: settings.direccion || '',
        telefono: settings.telefono || '',
        email: settings.email || '',
        sitio_web: settings.sitio_web || '',
        pais: settings.country || '',
        moneda: settings.moneda || 'USD'
      });
      
      if (settings.logo_url) {
        setLogoPreview(settings.logo_url);
      }
      
      // Resetear el flag de timeout si los datos cargaron exitosamente
      if (loadingTimedOut) {
        setLoadingTimedOut(false);
      }
    }
  }, [settings, loadingTimedOut]);

  // Manejo de cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Resetear status de guardado cuando se edita
    if (isSaved) setIsSaved(false);
  };

  // Manejo de subida de logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Crear preview del logo
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Resetear status de guardado cuando se edita
      if (isSaved) setIsSaved(false);
    }
  };

  // Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user?.isGuest) {
      setErrorMessage('Los usuarios invitados no pueden modificar la configuración');
      setSaveStatus('error');
      return;
    }
    
    try {
      setSaveStatus('saving');
      setErrorMessage(null);
      
      // Map form data to the correct database field names
      const dataToUpdate = {
        name: formData.nombre,
        nombre_empresa: formData.nombre,
        tax_id: formData.identificador_fiscal,
        rut: formData.identificador_fiscal,
        direccion: formData.direccion,
        telefono: formData.telefono,
        sitio_web: formData.sitio_web,
        country: formData.pais,
      };
      
      // Primero actualizar los datos de la empresa
      const result = await updateCompanySettings(dataToUpdate);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Si hay un nuevo logo, subirlo
      if (logoFile) {
        const logoResult = await uploadLogo(logoFile);
        if (!logoResult.success) {
          throw new Error(logoResult.error);
        }
        setLogoFile(null); // Resetear después de subir
      }
      
      // Refrescar datos para confirmar los cambios
      await refreshData();
      
      setSaveStatus('success');
      setIsSaved(true);
      
      // Dispatch a custom event to notify other components of company update
      const event = new CustomEvent('company-updated', {
        detail: { timestamp: Date.now() }
      });
      window.dispatchEvent(event);
      
      // Give the event time to propagate before showing success
      setTimeout(() => {
        setSaveStatus('idle');
        
        // Reload the page after 1 second to show updated information everywhere
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }, 2000);
      
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Error desconocido al guardar');
      setSaveStatus('error');
    }
  };

  if (isLoading && !loadingTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    );
  }
  
  // UI para cuando la carga ha tardado demasiado tiempo
  if (loadingTimedOut) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Tiempo de carga excedido</AlertTitle>
          <AlertDescription>
            La carga de la configuración está tomando más tiempo del esperado. 
            Puedes intentar recargar manualmente o volver más tarde.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-4">
          <Button 
            onClick={handleManualRefresh}
            variant="default"
          >
            Recargar datos
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
          >
            Volver al dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (user?.isGuest) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="default" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Usuario Invitado</AlertTitle>
          <AlertDescription>
            Las opciones de configuración no están disponibles en modo invitado.
            Para acceder a todas las funcionalidades, por favor regístrate o inicia sesión.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>
              La configuración está deshabilitada en modo invitado
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={() => refreshData()}
          variant="outline"
        >
          Reintentar
            </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {saveStatus === 'success' && (
        <Alert variant="default" className="mb-6">
          <Check className="h-4 w-4" />
          <AlertTitle>Guardado</AlertTitle>
          <AlertDescription>
            Los cambios han sido guardados exitosamente.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="empresa" className="w-full">
          <TabsList>
            <TabsTrigger value="empresa">Datos de Empresa</TabsTrigger>
            <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
            <TabsTrigger value="opciones">Opciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="empresa">
            <Card>
          <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
            <CardDescription>
                  Modifique los datos básicos de su empresa
            </CardDescription>
          </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre de la Empresa</Label>
                    <Input 
                      id="nombre" 
                      name="nombre"
                      placeholder="Nombre de su empresa" 
                      value={formData.nombre}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="identificador_fiscal">Identificador Fiscal (RUT/NIT)</Label>
                    <Input 
                      id="identificador_fiscal" 
                      name="identificador_fiscal"
                      placeholder="RUT o NIT" 
                      value={formData.identificador_fiscal}
                      onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                  <Textarea 
                  id="direccion"
                  name="direccion"
                    placeholder="Dirección completa"
                  value={formData.direccion}
                  onChange={handleInputChange}
                />
              </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                      placeholder="Teléfono de contacto" 
                  value={formData.telefono}
                  onChange={handleInputChange}
                />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      placeholder="Email de contacto" 
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sitio_web">Sitio Web</Label>
                <Input
                  id="sitio_web"
                  name="sitio_web"
                    placeholder="URL de su sitio web" 
                  value={formData.sitio_web}
                  onChange={handleInputChange}
                />
              </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pais">País</Label>
                    <Input 
                      id="pais" 
                      name="pais"
                      placeholder="País" 
                      value={formData.pais}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="moneda">Moneda</Label>
                    <Input 
                      id="moneda" 
                      name="moneda"
                      placeholder="Moneda (ej: USD)" 
                      value={formData.moneda}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="apariencia">
          <Card>
            <CardHeader>
                <CardTitle>Apariencia</CardTitle>
              <CardDescription>
                  Personalice la apariencia de su aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo de la Empresa</Label>
                  
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <div className="w-24 h-24 border rounded flex items-center justify-center overflow-hidden">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="max-w-full max-h-full object-contain" 
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label 
                        htmlFor="logo-upload" 
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      >
                        <Upload className="h-4 w-4" />
                        Subir Logo
                      </Label>
                      <Input 
                        id="logo-upload" 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleLogoChange}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Recomendado: PNG o JPG, máximo 2MB
                  </p>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="opciones">
          <Card>
            <CardHeader>
                <CardTitle>Opciones Adicionales</CardTitle>
              <CardDescription>
                  Configure opciones adicionales para su aplicación
              </CardDescription>
            </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Opciones adicionales estarán disponibles próximamente.
                </p>
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end gap-4">
          <Button 
            type="submit" 
            disabled={isSaving || saveStatus === 'saving'} 
            className="min-w-[120px]"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando
              </>
            ) : 'Guardar Cambios'}
          </Button>
                </div>
      </form>
              </div>
  );
}
