import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, HelpCircle, Book, MessageCircle, Video } from "lucide-react";

export default function AyudaPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Centro de Ayuda</h1>
        <Button>
          <MessageCircle className="w-4 h-4 mr-2" /> Contactar Soporte
        </Button>
      </div>

      <div className="relative w-full max-w-xl mx-auto mb-8">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar en la documentación..."
          className="pl-10 py-6"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <Book className="h-8 w-8 mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">Documentación</h3>
          <p className="text-muted-foreground mb-4">
            Guías detalladas y referencias técnicas
          </p>
          <Button variant="outline" className="w-full">
            Ver Documentación
          </Button>
        </Card>

        <Card className="p-6">
          <Video className="h-8 w-8 mb-4 text-green-600" />
          <h3 className="text-lg font-semibold mb-2">Tutoriales</h3>
          <p className="text-muted-foreground mb-4">
            Videos explicativos paso a paso
          </p>
          <Button variant="outline" className="w-full">
            Ver Tutoriales
          </Button>
        </Card>

        <Card className="p-6">
          <HelpCircle className="h-8 w-8 mb-4 text-purple-600" />
          <h3 className="text-lg font-semibold mb-2">FAQs</h3>
          <p className="text-muted-foreground mb-4">
            Preguntas frecuentes y soluciones
          </p>
          <Button variant="outline" className="w-full">
            Ver FAQs
          </Button>
        </Card>
      </div>
    </div>
  );
}
