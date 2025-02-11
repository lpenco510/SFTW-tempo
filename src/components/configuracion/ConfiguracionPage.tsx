import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Bell, Shield, Palette, User } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <Button>
          <Settings className="w-4 h-4 mr-2" /> Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" /> Perfil
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input placeholder="Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input placeholder="juan@ejemplo.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input placeholder="Mi Empresa S.A." />
            </div>
          </div>
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
