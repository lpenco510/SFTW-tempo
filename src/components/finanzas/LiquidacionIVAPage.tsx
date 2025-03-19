import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, DollarSign, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LiquidacionIVAPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Liquidación IVA</h1>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar AFIP
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              IVA a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$45,678</p>
            <p className="text-sm text-muted-foreground">Período actual</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Crédito Fiscal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$12,345</p>
            <p className="text-sm text-muted-foreground">Disponible</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximo Vencimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">15/03</p>
            <p className="text-sm text-muted-foreground">En 23 días</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Comprobantes del Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Aquí irá la tabla de comprobantes */}
              <p className="text-muted-foreground">No hay comprobantes registrados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Liquidaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Aquí irá el gráfico de liquidaciones históricas */}
              <p className="text-muted-foreground">No hay datos históricos disponibles</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
