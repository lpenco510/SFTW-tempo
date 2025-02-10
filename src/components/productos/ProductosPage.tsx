import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Plus, Search } from "lucide-react";

export default function ProductosPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50">
          <h3 className="font-semibold mb-2">Total Productos</h3>
          <p className="text-2xl font-bold">1,234</p>
        </Card>
        <Card className="p-4 bg-green-50">
          <h3 className="font-semibold mb-2">En Stock</h3>
          <p className="text-2xl font-bold">987</p>
        </Card>
        <Card className="p-4 bg-yellow-50">
          <h3 className="font-semibold mb-2">Bajo Stock</h3>
          <p className="text-2xl font-bold">45</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar productos..." className="pl-8" />
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
