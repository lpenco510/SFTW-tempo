import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, TrendingUp, DollarSign, PieChart } from "lucide-react";

export default function AnalisisPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Análisis Financiero</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$234,567</p>
            <p className="text-sm text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Crecimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">+15.4%</p>
            <p className="text-sm text-muted-foreground">vs. mes anterior</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Operaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">128</p>
            <p className="text-sm text-muted-foreground">Completadas</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Margen Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">23.5%</p>
            <p className="text-sm text-muted-foreground">Por operación</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tendencias de Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {/* Aquí irá el gráfico de tendencias */}
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Cargando datos de tendencias...</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {/* Aquí irá el gráfico de distribución */}
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Cargando distribución...</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Principales Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Aquí irá la lista de principales clientes */}
              <p className="text-muted-foreground">No hay datos disponibles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métricas Detalladas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Tiempo Promedio</h3>
              <p className="text-2xl font-bold">4.2 días</p>
              <p className="text-sm text-muted-foreground">Por operación</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Satisfacción</h3>
              <p className="text-2xl font-bold">94%</p>
              <p className="text-sm text-muted-foreground">Clientes satisfechos</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Retención</h3>
              <p className="text-2xl font-bold">87%</p>
              <p className="text-sm text-muted-foreground">Tasa de retención</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
