import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, ThumbsDown, Send } from "lucide-react";

export default function FeedbackPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feedback</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Enviar Feedback</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              <ThumbsUp className="w-4 h-4 mr-2" /> Me gusta
            </Button>
            <Button variant="outline" className="flex-1">
              <ThumbsDown className="w-4 h-4 mr-2" /> No me gusta
            </Button>
          </div>
          <Textarea
            placeholder="Cuéntanos más sobre tu experiencia..."
            className="min-h-[150px]"
          />
          <Button className="w-full">
            <Send className="w-4 h-4 mr-2" /> Enviar Feedback
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Feedback Enviado</h2>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Hace 2 días</span>
            </div>
            <p>La nueva interfaz es muy intuitiva y fácil de usar.</p>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsDown className="w-4 h-4 text-red-600" />
              <span className="text-sm text-muted-foreground">Hace 5 días</span>
            </div>
            <p>Sería útil tener más opciones de filtrado en las tablas.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
