import React, { useState, useEffect, memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpIcon, 
  ArrowDownIcon, 
  TrendingUpIcon, 
  TrendingDownIcon, 
  Activity, 
  DollarSign,
  PackageIcon, 
  Clock,
  BarChart2,
  AlertTriangle,
  Award,
  PercentIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

// Interfaces para tipado
interface WidgetData {
  title: string;
  value: string;
  previousValue: string;
  change: string;
  changeValue: string;
  trend: "up" | "down";
  description: string;
  icon: React.ElementType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  tooltip: string;
  completion: number;
}

interface WidgetProps {
  widget: WidgetData;
  index: number;
  isHovered: boolean;
  onHover: (index: number | null) => void;
}

// Datos memoizados para evitar recrearlos en cada render
const widgets: WidgetData[] = [
  {
    title: "Valor total de envíos",
    value: "$452,621",
    previousValue: "$403,050",
    change: "+12.3%",
    changeValue: "+$49,571",
    trend: "up",
    description: "vs mes anterior",
    icon: DollarSign,
    color: "bg-blue-500",
    gradientFrom: "from-blue-50",
    gradientTo: "to-indigo-50",
    tooltip: "El valor acumulado de todos los envíos procesados en el período actual",
    completion: 82
  },
  {
    title: "Envíos completados",
    value: "843",
    previousValue: "776",
    change: "+8.7%",
    changeValue: "+67",
    trend: "up",
    description: "vs mes anterior",
    icon: PackageIcon,
    color: "bg-emerald-500",
    gradientFrom: "from-emerald-50",
    gradientTo: "to-green-50",
    tooltip: "Número total de envíos que han llegado a su destino en el período actual",
    completion: 76
  },
  {
    title: "Tiempo promedio",
    value: "3.2 días",
    previousValue: "3.8 días",
    change: "-15.5%",
    changeValue: "-0.6 días",
    trend: "down",
    description: "vs mes anterior",
    icon: Clock,
    color: "bg-purple-500",
    gradientFrom: "from-purple-50",
    gradientTo: "to-pink-50",
    tooltip: "Tiempo promedio de entrega de los envíos en el período actual",
    completion: 65
  },
  {
    title: "Tasa de incidencias",
    value: "1.2%",
    previousValue: "1.3%",
    change: "-7.7%",
    changeValue: "-0.1%",
    trend: "down",
    description: "vs mes anterior",
    icon: AlertTriangle,
    color: "bg-amber-500",
    gradientFrom: "from-amber-50",
    gradientTo: "to-yellow-50",
    tooltip: "Porcentaje de envíos con alguna incidencia o reclamo en el período actual",
    completion: 92
  },
  {
    title: "Costo promedio",
    value: "$125.38",
    previousValue: "$132.45",
    change: "-5.3%",
    changeValue: "-$7.07",
    trend: "down",
    description: "vs mes anterior",
    icon: PercentIcon,
    color: "bg-cyan-500",
    gradientFrom: "from-cyan-50",
    gradientTo: "to-blue-50",
    tooltip: "Costo promedio por envío en el período actual",
    completion: 78
  },
  {
    title: "Satisfacción cliente",
    value: "94.5%",
    previousValue: "92.8%",
    change: "+1.8%",
    changeValue: "+1.7%",
    trend: "up",
    description: "vs mes anterior",
    icon: Award,
    color: "bg-rose-500",
    gradientFrom: "from-rose-50",
    gradientTo: "to-red-50",
    tooltip: "Nivel de satisfacción reportado por los clientes en el período actual",
    completion: 94
  },
];

// Componente skeleton memoizado para mejorar rendimiento
const WidgetSkeleton = memo(() => (
  <div className="animate-pulse rounded-xl bg-card border h-full flex flex-col p-6 space-y-2">
    <div className="h-5 w-24 bg-gray-200 rounded"></div>
    <div className="h-8 w-20 bg-gray-200 rounded mt-2"></div>
    <div className="h-5 w-16 bg-gray-200 rounded"></div>
          </div>
));

WidgetSkeleton.displayName = 'WidgetSkeleton';

// Componente individual para cada widget
const Widget = memo(({ widget, index, isHovered, onHover }: WidgetProps) => (
  <motion.div
    key={widget.title}
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ 
      duration: 0.3, 
      delay: index * 0.05, // Reducido para mejorar rendimiento
      ease: "easeOut" 
    }}
    onHoverStart={() => onHover(index)}
    onHoverEnd={() => onHover(null)}
    className="min-w-[250px]"
  >
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={`h-full hover:shadow-md transition-all duration-300 
                        overflow-hidden relative border-t-4`} 
            style={{ borderTopColor: widget.color.replace('bg-', 'var(--') + ')' }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${widget.gradientFrom} ${widget.gradientTo} opacity-40`}></div>
            
            <CardContent className="p-5 flex flex-col h-full relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{widget.title}</span>
                <div className={`${widget.color} text-white p-2 rounded-md`}>
                  <widget.icon className="h-4 w-4" />
          </div>
        </div>
              
              <div className="mt-1">
                <div className="text-3xl font-bold">{widget.value}</div>
                
                <div className="flex flex-col mt-2 gap-1">
                  <div className="flex items-center">
                    <Badge 
                      variant={widget.trend === "up" ? 
                        (widget.title.includes("incidencia") ? "destructive" : "default") : 
                        (widget.title.includes("incidencia") ? "default" : "destructive")} 
                      className="mr-2"
                    >
                      <span className="flex items-center text-xs">
                        {widget.trend === "up" ? (
                          <TrendingUpIcon className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDownIcon className="w-3 h-3 mr-1" />
                        )}
                        {widget.change}
                      </span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">{widget.description}</span>
        </div>
                  
                  <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span>Período anterior: {widget.previousValue}</span>
                    <span>{widget.changeValue}</span>
          </div>
        </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progreso mensual</span>
                    <span>{widget.completion}%</span>
          </div>
                  <Progress value={widget.completion} className="h-1.5" />
          </div>
        </div>
            </CardContent>
            
            {isHovered && (
              <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            )}
      </Card>
        </TooltipTrigger>
        <TooltipContent className="p-2 max-w-[240px] text-xs">
          {widget.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </motion.div>
));

Widget.displayName = 'Widget';

// Componente principal memoizado
const SummaryWidgets = memo(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [visibleWidgets, setVisibleWidgets] = useState(4);
  const [hovered, setHovered] = useState<number | null>(null);

  // Reducir la carga inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Memoizar el handler para prevenir recreaciones
  const handleExpand = useMemo(() => () => {
    setVisibleWidgets(prev => prev === 4 ? widgets.length : 4);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <WidgetSkeleton key={i} />
        ))}
          </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Resumen Operativo</h2>
        {widgets.length > 4 && (
          <button
            onClick={handleExpand}
            className="text-sm text-primary hover:underline"
          >
            {visibleWidgets === 4 ? "Ver todos los indicadores" : "Ver menos"}
          </button>
        )}
          </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {widgets
          .slice(0, visibleWidgets)
          .map((widget, index) => (
            <Widget 
              key={widget.title} 
              widget={widget} 
              index={index} 
              isHovered={hovered === index}
              onHover={setHovered}
            />
          ))}
        </div>
    </div>
  );
});

SummaryWidgets.displayName = 'SummaryWidgets';

export default SummaryWidgets;