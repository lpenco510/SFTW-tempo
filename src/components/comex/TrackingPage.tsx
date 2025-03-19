import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Package, Map } from "lucide-react";

export default function TrackingPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Seguimiento de Envíos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              En Tránsito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">15</p>
            <p className="text-sm text-muted-foreground">Envíos activos</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Entregados Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-muted-foreground">Entregas completadas</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Próximas Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">Para las próximas 24h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Envíos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Aquí irá el mapa y la lista de envíos */}
            <p className="text-muted-foreground">No hay envíos activos para mostrar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
