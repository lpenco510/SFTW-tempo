import React, { useState, useEffect, useMemo, memo, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Scatter,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart2, 
  TrendingUp, 
  Activity, 
  PieChart as PieChartIcon,
  RefreshCw,
  MapPin,
  Download,
  Clock as ClockIcon,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { mockPerformanceData, mockActivityData } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definiciones de interfaces para datos
interface PerformanceData {
  name: string;
    value: number;
}

interface ActivityData {
  name: string;
    value: number;
}

interface ChartData {
  performanceData: PerformanceData[];
  activityData: ActivityData[];
  categoryData: any[];
  regionData: any[];
  transportData: any[];
}

// Paleta de colores más moderna y atractiva
const COLORS = [
  "#4361ee", "#3a0ca3", "#7209b7", "#f72585", "#4cc9f0",
  "#4895ef", "#560bad", "#f15bb5", "#00bbf9", "#00f5d4",
  "#fee440", "#f15025", "#2ec4b6", "#e71d36", "#ff9f1c",
];

// Datos en un archivo separado (simulado en este componente)
import { mockData } from "@/lib/mock-data";

// Agregar al inicio del archivo después de las importaciones
interface ChartContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
}

interface ChartDataProps {
  data: any; // Idealmente debería ser más específico, pero usamos any para solucionar rápido
}

interface TabProps {
  data: any; // Igualmente, debería ser más específico
}

// Componente contenedor de gráfico con animación y estilos mejorados
const ChartContainer = memo(({ children, title, subtitle, icon: Icon }: ChartContainerProps) => (
  <motion.div
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="h-full"
  >
    <Card className="overflow-hidden shadow-sm border h-full transition-all duration-300 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b py-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-gray-800">{title}</CardTitle>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="bg-primary/10 p-2 rounded-full">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[250px] w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  </motion.div>
));

ChartContainer.displayName = 'ChartContainer';

// Componentes individuales para cada tipo de gráfico
const ValorEnviosChart = memo(({ data }: ChartDataProps) => (
  <ChartContainer 
    title="Valor de Envíos" 
    subtitle="Comparativa mensual" 
    icon={BarChart2}
  >
              <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{fontSize: 11}} />
        <YAxis tick={{fontSize: 11}} />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '8px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: 'none'
          }} 
          formatter={(value) => [`$${value.toLocaleString()}`, 'Valor']}
        />
        <Area
                    type="monotone"
          dataKey="valor"
          stroke="#4361ee"
          fillOpacity={1}
          fill="url(#colorValor)"
          animationDuration={1500}
                    strokeWidth={2}
                  />
      </AreaChart>
    </ResponsiveContainer>
  </ChartContainer>
));

ValorEnviosChart.displayName = 'ValorEnviosChart';

const CantidadEnviosChart = memo(({ data }: ChartDataProps) => (
  <ChartContainer 
    title="Cantidad de Envíos" 
    subtitle="Volumen mensual" 
    icon={Activity}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{fontSize: 11}} />
        <YAxis tick={{fontSize: 11}} />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '8px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: 'none'
          }}
          formatter={(value) => [value, 'Cantidad']} 
        />
        <Bar 
          dataKey="cantidad" 
          fill="#7209b7" 
          radius={[4, 4, 0, 0]} 
          animationDuration={1500} 
          animationBegin={300}
        />
      </BarChart>
    </ResponsiveContainer>
  </ChartContainer>
));

CantidadEnviosChart.displayName = 'CantidadEnviosChart';

const CategoriasChart = memo(({ data }: ChartDataProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  return (
    <ChartContainer 
      title="Distribución por Categoría" 
      subtitle="Participación porcentual" 
      icon={PieChartIcon}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data?.categoryData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={onPieEnter}
            animationDuration={1500}
            animationBegin={600}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {data?.categoryData && data.categoryData.length > 0 ? (
              data.categoryData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="none"
                  className="hover:opacity-80 transition-opacity duration-300"
                />
              ))
            ) : (
              <Cell fill="#ccc" />
            )}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            formatter={(value, name, props) => [`${value} envíos (${props.payload.percent}%)`, 'Cantidad']}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
});

CategoriasChart.displayName = 'CategoriasChart';

const EficienciaChart = memo(({ data }: ChartDataProps) => (
  <ChartContainer 
    title="Índice de Eficiencia Logística" 
    subtitle="Por método de transporte" 
    icon={TrendingUp}
  >
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart 
        cx="50%" 
        cy="50%" 
        innerRadius="20%" 
        outerRadius="80%" 
        barSize={20} 
        data={data.transportData}
        startAngle={180} 
        endAngle={0}
      >
        <RadialBar
          label={{ fill: '#666', position: 'insideStart' }}
          background
          dataKey="eficiencia"
          name="name"
        >
          {data.transportData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </RadialBar>
        <Legend 
          iconSize={10} 
          width={120} 
          height={140} 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          wrapperStyle={{ paddingLeft: '10px' }}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '8px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: 'none'
          }}
          formatter={(value) => [`${value}%`, 'Eficiencia']}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  </ChartContainer>
));

EficienciaChart.displayName = 'EficienciaChart';

const RegionesChart = memo(({ data }: ChartDataProps) => (
  <ChartContainer 
    title="Distribución por Región" 
    subtitle="Participación porcentual"
    icon={MapPin}
  >
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data.regionData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}%`}
        >
          {data.regionData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.fill} 
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            borderRadius: '8px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: 'none' 
          }}
          formatter={(value) => [`${value}%`, 'Participación']}
        />
      </PieChart>
    </ResponsiveContainer>
  </ChartContainer>
));

RegionesChart.displayName = 'RegionesChart';

const TiempoEnvioChart = memo(({ data }: ChartDataProps) => (
  <ChartContainer 
    title="Tiempo de Envío" 
    subtitle="Promedio mensual (en días)"
    icon={ClockIcon}
  >
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 'dataMax + 1']} />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '8px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: 'none'
          }}
          formatter={(value) => [`${value} días`, 'Tiempo de Envío']}
        />
        <Legend />
        <defs>
          <linearGradient id="colorTiempo" x1="0" y1="0" x2="1" y2="0">
            <stop offset="5%" stopColor="#f72585" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#4cc9f0" stopOpacity={0.8}/>
          </linearGradient>
        </defs>
                  <Line
                    type="monotone"
          dataKey="tiempoEnvio"
          stroke="url(#colorTiempo)"
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, fill: "white" }}
          activeDot={{ r: 8 }}
          animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
  </ChartContainer>
));

TiempoEnvioChart.displayName = 'TiempoEnvioChart';

// Componentes para vistas de pestañas
const OverviewTab = memo(({ data }: TabProps) => {
  if (!data || !Array.isArray(data)) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">No hay datos disponibles para mostrar</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      layout
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <motion.div layout transition={{ duration: 0.3 }}>
        <ValorEnviosChart data={data} />
      </motion.div>
      <motion.div layout transition={{ duration: 0.3, delay: 0.1 }}>
        <CantidadEnviosChart data={data} />
      </motion.div>
      <motion.div layout transition={{ duration: 0.3, delay: 0.2 }}>
        <CategoriasChart data={data} />
      </motion.div>
      <motion.div layout transition={{ duration: 0.3, delay: 0.3 }}>
        <EficienciaChart data={data} />
      </motion.div>
    </motion.div>
  );
});

OverviewTab.displayName = 'OverviewTab';

const FinancialTab = memo(({ data }: TabProps) => {
  if (!data || !Array.isArray(data)) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">No hay datos disponibles para mostrar</p>
            </div>
    );
  }
  
  return (
    <motion.div 
      layout
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ChartContainer 
        title="Ingresos vs Costos" 
        subtitle="Análisis comparativo mensual"
        icon={BarChart2}
      >
              <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            />
                  <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="valor" 
              name="Ingresos" 
              fill="#4361ee" 
              radius={[4, 4, 0, 0]}
            />
                  <Line
              yAxisId="right"
                    type="monotone"
              dataKey="costoTotal"
              name="Costos"
              stroke="#f72585"
                    strokeWidth={2}
                  />
          </ComposedChart>
              </ResponsiveContainer>
      </ChartContainer>
      <ChartContainer 
        title="Valor Promedio por Envío" 
        subtitle="Tendencia mensual"
        icon={TrendingUp}
      >
              <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
                  <YAxis />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: 'none'
              }}
              formatter={(value) => [`$${value}`, 'Valor Promedio']}
            />
                  <Legend />
                  <Line
                    type="monotone"
              dataKey="promedio"
              stroke="#560bad"
                    strokeWidth={2}
              dot={{ r: 5, strokeWidth: 1 }}
              activeDot={{ r: 8 }}
              animationDuration={1500}
                  />
            <Scatter dataKey="promedio" fill="#560bad" />
          </ComposedChart>
              </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );
});

FinancialTab.displayName = 'FinancialTab';

const RegionalTab = memo(({ data }: TabProps) => {
  if (!data || !data.monthlyData || !data.regionData) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">No hay datos disponibles para mostrar</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      layout
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <RegionesChart data={data} />
      <TiempoEnvioChart data={data.monthlyData} />
    </motion.div>
  );
});

RegionalTab.displayName = 'RegionalTab';

// Componente optimizado con memo para evitar re-renders
const AreaChartComponent = React.memo(({ data, dataKey, colorStart, colorEnd }: any) => (
  <ResponsiveContainer width="100%" height={250}>
    <AreaChart
      data={data}
      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
    >
      <defs>
        <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colorStart} stopOpacity={0.8} />
          <stop offset="95%" stopColor={colorEnd} stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
      <XAxis dataKey="name" tick={{fontSize: 11}} />
      <YAxis tick={{fontSize: 11}} />
      <Tooltip 
        contentStyle={{ backgroundColor: "rgba(17, 24, 39, 0.9)", color: "#fff", border: "none", borderRadius: "4px" }}
        labelStyle={{ fontWeight: "bold", color: "#fff" }}
      />
      <Legend />
      <Area 
        type="monotone" 
        dataKey={dataKey} 
        stroke={colorStart} 
        fillOpacity={1} 
        fill={`url(#color${dataKey})`} 
      />
    </AreaChart>
  </ResponsiveContainer>
));

// Componente optimizado con memo para evitar re-renders
const BarChartComponent = React.memo(({ data, dataKey, colors }: any) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart
      data={data}
      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
      <XAxis dataKey="name" tick={{fontSize: 11}} />
      <YAxis tick={{fontSize: 11}} />
      <Tooltip 
        contentStyle={{ backgroundColor: "rgba(17, 24, 39, 0.9)", color: "#fff", border: "none", borderRadius: "4px" }}
        labelStyle={{ fontWeight: "bold", color: "#fff" }}
      />
      <Legend />
      <Bar dataKey={dataKey} fill={colors[0]} />
    </BarChart>
  </ResponsiveContainer>
));

// Optimización: Datos de demostración para facilitar pruebas y mejorar la performance
const generateDemoData = (memoKey: string) => {
  // Usamos un identificador único para cada conjunto de datos para facilitar memorización
  return useMemo(() => {
    console.log(`Generando datos de demostración para ${memoKey}`);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Datos para gráfica de envíos
    const shipmentsData = months.map((month, index) => ({
      name: month,
      envios: Math.floor(Math.random() * 1000) + 100,
      entregas: Math.floor(Math.random() * 800) + 50,
    }));
    
    // Datos para gráfica de ingresos
    const revenueData = months.map((month, index) => ({
      name: month,
      ingresos: Math.floor(Math.random() * 50000) + 10000,
      costos: Math.floor(Math.random() * 30000) + 5000,
      ganancia: Math.floor(Math.random() * 20000) + 5000,
    }));
    
    // Datos para gráfica de regiones
    const regionsData = [
      { name: 'Norte', valor: Math.floor(Math.random() * 500) + 100 },
      { name: 'Sur', valor: Math.floor(Math.random() * 500) + 100 },
      { name: 'Este', valor: Math.floor(Math.random() * 500) + 100 },
      { name: 'Oeste', valor: Math.floor(Math.random() * 500) + 100 },
      { name: 'Centro', valor: Math.floor(Math.random() * 500) + 100 },
    ];
    
    // Datos para el gauge chart
    const gaugeData = [
      { name: 'Completado', value: Math.floor(Math.random() * 70) + 30 },
    ];
    
    // Datos para gráfico de satisfacción
    const satisfactionData = [
      { name: 'Excelente', valor: Math.floor(Math.random() * 50) + 30 },
      { name: 'Bueno', valor: Math.floor(Math.random() * 40) + 20 },
      { name: 'Regular', valor: Math.floor(Math.random() * 20) + 10 },
      { name: 'Malo', valor: Math.floor(Math.random() * 10) + 5 },
    ];
    
    return {
      shipmentsData,
      revenueData,
      regionsData,
      gaugeData,
      satisfactionData
    };
  }, [memoKey]); // Solo regenerar cuando cambie la key
};

// Colores de la aplicación para mantener consistencia
const APP_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  tertiary: '#8b5cf6',
  quaternary: '#f59e0b',
  error: '#ef4444',
  success: '#22c55e',
  dark: '#1e293b',
  light: '#e2e8f0',
};

// Componente principal mejorado y optimizado
const TrendsCharts = () => {
  const [timeRange, setTimeRange] = useState("7");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const hasMounted = useRef(false);
  
  // Estado principal para todos los datos de gráficos
  const [chartData, setChartData] = useState<ChartData>({
    performanceData: [],
    activityData: [],
    categoryData: mockData.categoryData || [],
    regionData: mockData.regionData || [],
    transportData: mockData.transportData || []
  });

  // Generamos los datos de demostración de manera eficiente
  const { shipmentsData, revenueData, regionsData, gaugeData, satisfactionData } = 
    generateDemoData("main-dashboard-data");

  // Optimización para mejorar la carga
  useEffect(() => {
    console.log("TrendsCharts: Configurando temporizador para datos");
    
    // Evitar doble ejecución en Strict Mode
    if (hasMounted.current) return;
    hasMounted.current = true;
    
    // Simular tiempo de carga
    const timer = setTimeout(() => {
      try {
        setIsLoading(false);
        console.log("TrendsCharts: Datos cargados");
      } catch (e) {
        setError("Error al cargar datos: " + (e instanceof Error ? e.message : String(e)));
        setIsLoading(false);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  // Función para filtrar datos según el rango seleccionado
  const getFilteredData = (days: string) => {
    // En una app real, haríamos una llamada API con el filtro o filtraríamos datos locales
    // Aquí simplemente devolvemos los mismos datos
    return chartData;
  };

  // Cambiar el rango de tiempo
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    // En una app real, aquí recargaríamos los datos con un nuevo fetch
  };

  // Renderizar estado de carga
  if (error) {
    return (
      <Card className="col-span-2 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Error en gráficas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              hasMounted.current = false;
            }}
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Tendencias
        </CardTitle>
        <CardDescription>
          Análisis de tendencias y estadísticas clave
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="financiero">Financiero</TabsTrigger>
            <TabsTrigger value="regional">Regional</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <p className="text-muted-foreground">Cargando datos...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Envíos Mensuales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AreaChartComponent 
                        data={shipmentsData} 
                        dataKey="envios" 
                        colorStart={APP_COLORS.primary} 
                        colorEnd={APP_COLORS.primary}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Entrega vs Planificación</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BarChartComponent 
                        data={shipmentsData} 
                        dataKey="entregas" 
                        colors={[APP_COLORS.secondary]}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Rendimiento Global</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" tick={{fontSize: 11}} />
                        <YAxis yAxisId="left" tick={{fontSize: 11}} />
                        <YAxis yAxisId="right" orientation="right" tick={{fontSize: 11}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "rgba(17, 24, 39, 0.9)", color: "#fff", border: "none", borderRadius: "4px" }}
                          labelStyle={{ fontWeight: "bold", color: "#fff" }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="ingresos" fill={APP_COLORS.primary} opacity={0.8} />
                        <Line yAxisId="right" type="monotone" dataKey="ganancia" stroke={APP_COLORS.success} strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="financiero" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Ingresos vs Costos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart
                          data={revenueData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={APP_COLORS.tertiary} stopOpacity={0.8} />
                              <stop offset="95%" stopColor={APP_COLORS.tertiary} stopOpacity={0.2} />
                            </linearGradient>
                            <linearGradient id="colorCostos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={APP_COLORS.quaternary} stopOpacity={0.8} />
                              <stop offset="95%" stopColor={APP_COLORS.quaternary} stopOpacity={0.2} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" tick={{fontSize: 11}} />
                          <YAxis tick={{fontSize: 11}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "rgba(17, 24, 39, 0.9)", color: "#fff", border: "none", borderRadius: "4px" }}
                            labelStyle={{ fontWeight: "bold", color: "#fff" }}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="ingresos" stroke={APP_COLORS.tertiary} fillOpacity={1} fill="url(#colorIngresos)" />
                          <Area type="monotone" dataKey="costos" stroke={APP_COLORS.quaternary} fillOpacity={1} fill="url(#colorCostos)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Objetivo Mensual</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <ResponsiveContainer width="100%" height={250}>
                        <RadialBarChart 
                          cx="50%" 
                          cy="50%" 
                          innerRadius="40%" 
                          outerRadius="80%" 
                          barSize={20} 
                          data={gaugeData}
                          startAngle={180} 
                          endAngle={0}
                        >
                          <RadialBar
                            background
                            clockWise
                            dataKey="value"
                            cornerRadius={10}
                          >
                            {gaugeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={APP_COLORS.tertiary} />
                            ))}
                          </RadialBar>
                          <Tooltip 
                            contentStyle={{ backgroundColor: "rgba(17, 24, 39, 0.9)", color: "#fff", border: "none", borderRadius: "4px" }}
                            labelStyle={{ fontWeight: "bold", color: "#fff" }}
                            formatter={(value) => [`${value}%`, 'Completado']}
                          />
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-2xl font-bold"
                            fill={APP_COLORS.dark}
                          >
                            {`${gaugeData[0].value}%`}
                          </text>
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ganancias Mensuales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={revenueData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" tick={{fontSize: 11}} />
                        <YAxis tick={{fontSize: 11}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "rgba(17, 24, 39, 0.9)", color: "#fff", border: "none", borderRadius: "4px" }}
                          labelStyle={{ fontWeight: "bold", color: "#fff" }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="ganancia" stroke={APP_COLORS.success} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="regional" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Distribución por Región</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={regionsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="valor"
                          >
                            {regionsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={[APP_COLORS.primary, APP_COLORS.secondary, APP_COLORS.tertiary, APP_COLORS.quaternary, APP_COLORS.dark][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: "rgba(17, 24, 39, 0.9)", color: "#fff", border: "none", borderRadius: "4px" }}
                            labelStyle={{ fontWeight: "bold", color: "#fff" }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Satisfacción por Región</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={satisfactionData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis type="number" tick={{fontSize: 11}} />
                          <YAxis dataKey="name" type="category" tick={{fontSize: 11}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "rgba(17, 24, 39, 0.9)", color: "#fff", border: "none", borderRadius: "4px" }}
                            labelStyle={{ fontWeight: "bold", color: "#fff" }}
                          />
                          <Legend />
                          <Bar dataKey="valor" fill={APP_COLORS.quaternary}>
                            {satisfactionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={
                                index === 0 ? APP_COLORS.success :
                                index === 1 ? APP_COLORS.primary :
                                index === 2 ? APP_COLORS.quaternary :
                                APP_COLORS.error
                              } />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Rendimiento Regional Comparativo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={regionsData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" tick={{fontSize: 11}} />
                        <YAxis tick={{fontSize: 11}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "rgba(17, 24, 39, 0.9)", color: "#fff", border: "none", borderRadius: "4px" }}
                          labelStyle={{ fontWeight: "bold", color: "#fff" }}
                        />
                        <Legend />
                        <Bar dataKey="valor" fill={APP_COLORS.tertiary}>
                          {regionsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={[APP_COLORS.primary, APP_COLORS.secondary, APP_COLORS.tertiary, APP_COLORS.quaternary, APP_COLORS.dark][index % 5]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TrendsCharts;