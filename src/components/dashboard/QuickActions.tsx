import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PackagePlus,
  FileText,
  Truck,
  BarChart2,
  Download,
  Upload,
  Clock,
  CreditCard,
  ExternalLink,
  Zap,
  Search,
  Box,
  HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";

// Definir la interfaz para una acción
interface ActionProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
  color: string;
  description: string;
  highlight: boolean;
  badge?: string;
}

// Interfaz para las props de ActionItem
interface ActionItemProps {
  action: ActionProps;
  index: number;
}

// Lista de acciones rápidas memoizada para evitar recrearla en cada render
const actions: ActionProps[] = [
  {
    icon: PackagePlus,
    label: "Nuevo Envío",
    href: "/shipments/new",
    color: "bg-blue-500",
    description: "Crear una nueva orden de envío",
    highlight: true,
    badge: "Rápido"
  },
  {
    icon: FileText,
    label: "Nuevo Documento",
    href: "/documents/new",
    color: "bg-emerald-500",
    description: "Subir documentación comercial",
    highlight: false
  },
  {
    icon: Upload,
    label: "Nueva Exportación",
    href: "/exports/new",
    color: "bg-amber-500",
    description: "Iniciar proceso de exportación",
    highlight: false
  },
  {
    icon: Download,
    label: "Nueva Importación",
    href: "/imports/new",
    color: "bg-purple-500",
    description: "Registrar una nueva importación",
    highlight: false
  },
  {
    icon: Search,
    label: "Tracking",
    href: "/tracking",
    color: "bg-pink-500",
    description: "Seguimiento de envíos en curso",
    highlight: true,
    badge: "Popular"
  },
  {
    icon: BarChart2,
    label: "Reportes",
    href: "/reports",
    color: "bg-cyan-500",
    description: "Generar informes y estadísticas",
    highlight: false
  },
  {
    icon: Box,
    label: "Inventario",
    href: "/inventory",
    color: "bg-indigo-500",
    description: "Gestionar stock de productos",
    highlight: false
  },
  {
    icon: CreditCard,
    label: "Pagos",
    href: "/payments",
    color: "bg-green-500",
    description: "Gestionar facturas y pagos",
    highlight: false
  },
];

// Optimizar animaciones para reducir la carga
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03, // Reducido para mejorar rendimiento
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 }, // Reducido para mejor rendimiento
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

// Componente para cada acción rápida, memoizado para evitar re-renders innecesarios
const ActionItem = memo(({ action, index }: ActionItemProps) => (
  <motion.div
    key={action.label}
    variants={itemVariants}
    whileHover={{ 
      scale: 1.02,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
    }}
    whileTap={{ scale: 0.98 }}
    className="relative"
    layout
  >
    <Button
      variant={action.highlight ? "default" : "outline"}
      className={`w-full h-auto py-4 px-3 flex flex-col items-center justify-center gap-2 
                ${!action.highlight && "border-dashed hover:border-solid hover:border-primary/50 hover:bg-primary/5"} 
                transition-all duration-300 rounded-lg overflow-hidden`}
      asChild
    >
      <a href={action.href} className="relative">
        {action.badge && (
          <span className="absolute top-0 right-0 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-bl-md rounded-tr-md font-medium">
            {action.badge}
          </span>
        )}
        <span className={`${action.color} text-white p-2 rounded-full mb-1`}>
          <action.icon className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium">{action.label}</span>
        <span className="text-[11px] text-muted-foreground mt-0.5 text-center px-1">
          {action.description}
        </span>
      </a>
    </Button>
  </motion.div>
));

ActionItem.displayName = 'ActionItem';

// Componente principal memoizado
const QuickActions = memo(() => {
  return (
    <Card className="overflow-hidden border shadow-md">
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
      <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Acciones Rápidas</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">
              Accesos directos a las funciones más utilizadas
            </CardDescription>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            <Zap className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          layout
        >
          {actions.map((action, index) => (
            <ActionItem key={action.label} action={action} index={index} />
          ))}
        </motion.div>
        
        <div className="mt-4 pt-3 border-t flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5 mr-1" />
            <span>¿Necesitas ayuda para comenzar?</span>
          </div>
          <Button variant="link" size="sm" className="h-8 p-0 flex items-center text-xs" asChild>
            <a href="/tutorials">
              Ver tutoriales
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
                </Button>
        </div>
      </CardContent>
    </Card>
  );
});

QuickActions.displayName = 'QuickActions';

export default QuickActions;