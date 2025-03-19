import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calculator } from "lucide-react";

export default function TarifasPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Tarifas y Costos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tarifa Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$2,450</p>
            <p className="text-sm text-muted-foreground">Por operación</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Variación Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">+5.2%</p>
            <p className="text-sm text-muted-foreground">vs. mes anterior</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Costos Operativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$1,200</p>
            <p className="text-sm text-muted-foreground">Promedio por operación</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tarifario Vigente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Aquí irá la tabla de tarifas */}
              <p className="text-muted-foreground">No hay tarifas configuradas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Costos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Aquí irá el gráfico de costos */}
              <p className="text-muted-foreground">No hay datos históricos disponibles</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
