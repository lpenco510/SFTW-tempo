import React from "react";
import { Card } from "@/components/ui/card";
import { BarChart2, PieChart, LineChart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalisisPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Análisis</h1>
        <Button>
          <Download className="w-4 h-4 mr-2" /> Exportar Reportes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Importaciones por País</h3>
          <div className="h-[300px] flex items-center justify-center">
            <PieChart className="h-32 w-32 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tendencia de Costos</h3>
          <div className="h-[300px] flex items-center justify-center">
            <LineChart className="h-32 w-32 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Volumen por Categoría</h3>
          <div className="h-[300px] flex items-center justify-center">
            <BarChart2 className="h-32 w-32 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">KPIs</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Tiempo promedio de importación</span>
              <span className="font-semibold">15 días</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Costo promedio por importación</span>
              <span className="font-semibold">$5,432</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tasa de éxito</span>
              <span className="font-semibold">98%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
