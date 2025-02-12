import React, { useRef, useState, useEffect } from "react";  // Add useEffect import
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Bell, Shield, Palette, User, Upload } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { toast } from "@/components/ui/use-toast";

export default function ConfiguracionPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    settings, 
    updateCompanyLogo, 
    updateCompanyName, 
    updateCompanySettings, 
    logoVersion,
    refetch: fetchCompanySettings 
  } = useCompanySettings();
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: settings?.name || '',
    direccion: settings?.settings?.direccion || '',
    telefono: settings?.settings?.telefono || '',
    sitio_web: settings?.settings?.sitio_web || ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || '',
        direccion: settings?.settings?.direccion || '',
        telefono: settings?.settings?.telefono || '',
        sitio_web: settings?.settings?.sitio_web || ''
      });
    }
  }, [settings]); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setHasChanges(true);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await updateCompanyLogo(file);
      toast({
        title: "Logo actualizado",
        description: "El logo de la empresa se ha actualizado correctamente.",
      });
            // Reload page after successful update
            setTimeout(() => {
              window.location.reload();
            }, 500); // Wait for toast to show
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el logo",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: settings?.name || '',
      direccion: settings?.settings?.direccion || '',
      telefono: settings?.settings?.telefono || '',
      sitio_web: settings?.settings?.sitio_web || ''
    });
    setHasChanges(false);
  };

  const handleCompanyUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (formData.name !== settings?.name) {
        await updateCompanyName(formData.name);
      }
  
      await updateCompanySettings({
        direccion: formData.direccion,
        telefono: formData.telefono,
        sitio_web: formData.sitio_web,
      });
      
      setHasChanges(false);
      toast({
        title: "Configuración actualizada",
        description: "Los datos de la empresa se han actualizado correctamente.",
      });
  
      // Reload page after successful update
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Wait for toast to show
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la configuración",
        variant: "destructive",
      });
    }
  };  

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configuración</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" /> Perfil de Empresa
          </h2>
          <form onSubmit={handleCompanyUpdate} className="space-y-4">
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
              <img
                  src={`${settings?.settings?.logo_url || '/default-logo.png'}?v=${logoVersion}`}
                  alt="Logo de la empresa"
                  className="w-32 h-32 object-contain border rounded-lg"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" /> Cambiar Logo
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Nombre de la Empresa</Label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Dirección de la empresa"
                />
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Teléfono de contacto"
                />
              </div>

              <div className="space-y-2">
                <Label>Sitio Web</Label>
                <Input
                  name="sitio_web"
                  value={formData.sitio_web}
                  onChange={handleInputChange}
                  placeholder="www.ejemplo.com"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!hasChanges}
                >
                  <Settings className="w-4 h-4 mr-2" /> Guardar Cambios
                </Button>
              </div>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notificaciones
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Notificaciones por Email</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label>Notificaciones Push</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label>Resumen Semanal</Label>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Seguridad
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contraseña Actual</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Nueva Contraseña</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Contraseña</Label>
              <Input type="password" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" /> Apariencia
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Modo Oscuro</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label>Animaciones</Label>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label>Idioma</Label>
              <select className="w-full p-2 border rounded-md">
                <option>Español</option>
                <option>English</option>
                <option>Português</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
