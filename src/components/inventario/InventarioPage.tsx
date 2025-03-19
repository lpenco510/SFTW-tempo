import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, Boxes } from "lucide-react";

export default function InventarioPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Total Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-sm text-muted-foreground">Items en stock</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">23</p>
            <p className="text-sm text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rotación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">15%</p>
            <p className="text-sm text-muted-foreground">Mensual</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5" />
              Ubicaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">45</p>
            <p className="text-sm text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Movimientos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Aquí irá la tabla de movimientos */}
              <p className="text-muted-foreground">No hay movimientos recientes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Aquí irá el gráfico de stock por categoría */}
              <p className="text-muted-foreground">No hay datos disponibles</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
