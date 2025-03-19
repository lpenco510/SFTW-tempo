import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart2, PieChart, LineChart, Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const topImportingCountries = [
  { country: "Brasil", value: 15234, percentage: 28 },
  { country: "China", value: 12456, percentage: 23 },
  { country: "Estados Unidos", value: 8765, percentage: 16 },
  { country: "Alemania", value: 5432, percentage: 10 },
  { country: "México", value: 4321, percentage: 8 },
];

const categoryVolumes = [
  { category: "Electrónicos", volume: 8500, growth: 12 },
  { category: "Automotriz", volume: 6700, growth: -5 },
  { category: "Químicos", volume: 5200, growth: 8 },
  { category: "Textiles", volume: 4100, growth: 15 },
  { category: "Alimentos", volume: 3800, growth: 3 },
];

const importTrends = [
  { month: "Ene", value: 4200 },
  { month: "Feb", value: 3800 },
  { month: "Mar", value: 4500 },
  { month: "Abr", value: 4100 },
  { month: "May", value: 4800 },
  { month: "Jun", value: 5200 },
];

export default function AnalisisPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Análisis de Comercio Exterior</h1>
        <Button>
          <Download className="w-4 h-4 mr-2" /> Exportar Reportes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Importaciones por País */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Principales Países de Origen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topImportingCountries.map((country) => (
                <div key={country.country} className="flex items-center gap-4">
                  <div className="w-24 font-medium">{country.country}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm text-muted-foreground">
                    {country.value.toLocaleString()} USD
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Volumen por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Volumen por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryVolumes.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={category.growth >= 0 ? "text-green-500" : "text-red-500"}>
                        {category.growth > 0 ? "+" : ""}{category.growth}%
                      </span>
                      <TrendingUp className={`h-4 w-4 ${category.growth >= 0 ? "text-green-500" : "text-red-500"}`} />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all"
                      style={{ width: `${(category.volume / 10000) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {category.volume.toLocaleString()} unidades
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tendencia de Importaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Tendencia de Importaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative">
              <div className="absolute inset-0 flex items-end justify-between gap-2">
                {importTrends.map((month, index) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-blue-500 rounded-t-md transition-all hover:opacity-90"
                      style={{ 
                        height: `${(month.value / 6000) * 100}%`,
                        background: `linear-gradient(to top, rgb(59, 130, 246), rgb(147, 197, 253))`
                      }}
                    />
                    <span className="text-sm text-muted-foreground">{month.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs y Métricas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Métricas Clave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-2xl font-bold">$4.8M</div>
                <div className="text-sm text-muted-foreground">Valor Total Importado</div>
                <div className="text-sm text-green-500">+12% vs. mes anterior</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">342</div>
                <div className="text-sm text-muted-foreground">Operaciones Activas</div>
                <div className="text-sm text-green-500">+8% vs. mes anterior</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">15.2</div>
                <div className="text-sm text-muted-foreground">Días Promedio de Tránsito</div>
                <div className="text-sm text-red-500">+2 días vs. objetivo</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm text-muted-foreground">Tasa de Entrega a Tiempo</div>
                <div className="text-sm text-green-500">+3% vs. objetivo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
