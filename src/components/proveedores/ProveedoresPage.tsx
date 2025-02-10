import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Plus, Search, Globe } from "lucide-react";

export default function ProveedoresPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Proveedores</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Proveedor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-purple-50">
          <h3 className="font-semibold mb-2">Total Proveedores</h3>
          <p className="text-2xl font-bold">156</p>
        </Card>
        <Card className="p-4 bg-indigo-50">
          <h3 className="font-semibold mb-2">Países</h3>
          <p className="text-2xl font-bold">24</p>
        </Card>
        <Card className="p-4 bg-pink-50">
          <h3 className="font-semibold mb-2">Activos este mes</h3>
          <p className="text-2xl font-bold">45</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar proveedores..." className="pl-8" />
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
