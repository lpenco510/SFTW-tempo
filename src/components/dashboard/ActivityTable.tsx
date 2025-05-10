import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// Datos de ejemplo para actividades recientes
const mockActivities = [
  {
    id: "act-1",
    type: "shipment",
    action: "create",
    description: "Nuevo envío creado: #SHP-2023-012",
    status: "completed",
    timestamp: "2023-11-02T14:32:00Z",
    user: {
      name: "Ana Morales",
      avatar: "/avatars/ana.jpg",
      initials: "AM",
    },
  },
  {
    id: "act-2",
    type: "document",
    action: "upload",
    description: "Documentación subida para envío #SHP-2023-011",
    status: "completed",
    timestamp: "2023-11-02T13:15:00Z",
    user: {
      name: "Carlos Fernández",
      avatar: "/avatars/carlos.jpg",
      initials: "CF",
    },
  },
  {
    id: "act-3",
    type: "import",
    action: "status_change",
    description: "Importación #IMP-2023-045 en tránsito",
    status: "in_progress",
    timestamp: "2023-11-02T11:40:00Z",
    user: {
      name: "Lucía Mendoza",
      avatar: "/avatars/lucia.jpg",
      initials: "LM",
    },
  },
  {
    id: "act-4",
    type: "compliance",
    action: "alert",
    description: "Alerta de cumplimiento en envío #SHP-2023-010",
    status: "pending",
    timestamp: "2023-11-02T10:20:00Z",
    user: {
      name: "Miguel Ángel",
      avatar: "/avatars/miguel.jpg",
      initials: "MA",
    },
  },
  {
    id: "act-5",
    type: "export",
    action: "approve",
    description: "Exportación #EXP-2023-022 aprobada",
    status: "completed",
    timestamp: "2023-11-02T09:05:00Z",
    user: {
      name: "Julia Pérez",
      avatar: "/avatars/julia.jpg",
      initials: "JP",
    },
  },
  {
    id: "act-6",
    type: "shipment",
    action: "update",
    description: "Actualización de datos en envío #SHP-2023-009",
    status: "completed",
    timestamp: "2023-11-01T16:45:00Z",
    user: {
      name: "Roberto Santos",
      avatar: "/avatars/roberto.jpg",
      initials: "RS",
    },
  },
  {
    id: "act-7",
    type: "compliance",
    action: "alert",
    description: "Alerta resuelta en importación #IMP-2023-044",
    status: "resolved",
    timestamp: "2023-11-01T15:30:00Z",
    user: {
      name: "Ana Morales",
      avatar: "/avatars/ana.jpg",
      initials: "AM",
    },
  },
  {
    id: "act-8",
    type: "document",
    action: "reject",
    description: "Documento rechazado para exportación #EXP-2023-021",
    status: "error",
    timestamp: "2023-11-01T14:20:00Z",
    user: {
      name: "Carlos Fernández",
      avatar: "/avatars/carlos.jpg",
      initials: "CF",
    },
  },
];

interface ActivityTableProps {
  showAll?: boolean;
}

const ActivityTable: React.FC<ActivityTableProps> = ({ showAll = false }) => {
  const [activities, setActivities] = useState(mockActivities);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completado
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <Clock className="w-3 h-3 mr-1" /> En Progreso
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" /> Pendiente
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" /> Error
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Resuelto
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Limitar actividades en la vista general
  const displayActivities = showAll ? activities : activities.slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones realizadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones realizadas en el sistema
          </CardDescription>
        </div>
        {!showAll && (
          <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-start sm:justify-center" asChild>
            <a href="/activity">
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Actividad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayActivities.map((activity, index) => (
              <motion.tr
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback>{activity.user.initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{activity.user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{activity.description}</TableCell>
                <TableCell>{getStatusBadge(activity.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Comentar</DropdownMenuItem>
                      <DropdownMenuItem>Marcar como revisado</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ActivityTable;