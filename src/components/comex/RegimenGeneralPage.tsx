import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Truck, FileText, Search, AlertCircle } from "lucide-react";

export default function RegimenGeneralPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Régimen General</h1>
        <Button>
          <FileText className="w-4 h-4 mr-2" /> Nueva Declaración
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50">
          <h3 className="font-semibold mb-2">En Proceso</h3>
          <p className="text-2xl font-bold">12</p>
        </Card>
        <Card className="p-4 bg-green-50">
          <h3 className="font-semibold mb-2">Completadas</h3>
          <p className="text-2xl font-bold">45</p>
        </Card>
        <Card className="p-4 bg-yellow-50">
          <h3 className="font-semibold mb-2">Pendientes</h3>
          <p className="text-2xl font-bold">8</p>
        </Card>
        <Card className="p-4 bg-red-50">
          <h3 className="font-semibold mb-2">Con Observaciones</h3>
          <p className="text-2xl font-bold">3</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar declaraciones..." className="pl-8" />
          </div>
          <div className="space-x-2">
            <Button variant="outline">Filtrar</Button>
            <Button variant="outline">Exportar</Button>
          </div>
        </div>

        <div className="rounded-md border">
          {/* Table implementation here */}
        </div>
      </Card>
    </div>
  );
}
