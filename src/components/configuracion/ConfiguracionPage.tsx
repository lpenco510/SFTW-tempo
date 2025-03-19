import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Bell, Shield, Palette, User, Upload } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function ConfiguracionPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    settings,
    updateCompanyLogo,
    updateCompanyName,
    updateCompanySettings,
    logoVersion,
    refetch: fetchCompanySettings,
  } = useCompanySettings();
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: settings?.name || "",
    direccion: settings?.settings?.direccion || "",
    telefono: settings?.settings?.telefono || "",
    sitio_web: settings?.settings?.sitio_web || "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || "",
        direccion: settings?.settings?.direccion || "",
        telefono: settings?.settings?.telefono || "",
        sitio_web: settings?.settings?.sitio_web || "",
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al actualizar el logo",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: settings?.name || "",
      direccion: settings?.settings?.direccion || "",
      telefono: settings?.settings?.telefono || "",
      sitio_web: settings?.settings?.sitio_web || "",
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
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al actualizar la configuración",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Perfil de Empresa */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil de Empresa
            </CardTitle>
            <CardDescription>
              Gestiona la información principal de tu empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCompanyUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo de la empresa</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg border overflow-hidden">
                    <img
                      src={`${settings?.logo_url}?v=${logoVersion}`}
                      alt={settings?.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Cambiar Logo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la empresa</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sitio_web">Sitio Web</Label>
                <Input
                  id="sitio_web"
                  name="sitio_web"
                  value={formData.sitio_web}
                  onChange={handleInputChange}
                />
              </div>

              {hasChanges && (
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar Cambios</Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Notificaciones y Seguridad */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Configura tus preferencias de notificación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe actualizaciones importantes por correo
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones en tiempo real
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Gestiona la seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticación de dos factores</Label>
                  <p className="text-sm text-muted-foreground">
                    Añade una capa extra de seguridad
                  </p>
                </div>
                <Switch />
              </div>
              <Button variant="outline" className="w-full">
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
