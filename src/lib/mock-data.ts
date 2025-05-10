// Datos simulados para los gráficos del dashboard
export const mockData = {
  // Datos mensuales para gráficos de línea y barras
  monthlyData: [
    { name: "Ene", valor: 35100, cantidad: 62, tiempoEnvio: 3.8, promedio: 566, costoTotal: 25500 },
    { name: "Feb", valor: 28700, cantidad: 51, tiempoEnvio: 3.6, promedio: 563, costoTotal: 20400 },
    { name: "Mar", valor: 42300, cantidad: 74, tiempoEnvio: 3.5, promedio: 572, costoTotal: 30800 },
    { name: "Abr", valor: 35800, cantidad: 63, tiempoEnvio: 3.4, promedio: 568, costoTotal: 25900 },
    { name: "May", valor: 39200, cantidad: 68, tiempoEnvio: 3.3, promedio: 576, costoTotal: 28500 },
    { name: "Jun", valor: 32500, cantidad: 58, tiempoEnvio: 3.4, promedio: 560, costoTotal: 23100 },
    { name: "Jul", valor: 37900, cantidad: 66, tiempoEnvio: 3.3, promedio: 574, costoTotal: 27200 },
    { name: "Ago", valor: 43500, cantidad: 75, tiempoEnvio: 3.2, promedio: 580, costoTotal: 31500 },
    { name: "Sep", valor: 38600, cantidad: 69, tiempoEnvio: 3.3, promedio: 559, costoTotal: 27800 },
    { name: "Oct", valor: 45200, cantidad: 79, tiempoEnvio: 3.2, promedio: 572, costoTotal: 32800 },
    { name: "Nov", valor: 48700, cantidad: 84, tiempoEnvio: 3.1, promedio: 580, costoTotal: 35100 },
    { name: "Dic", valor: 52200, cantidad: 94, tiempoEnvio: 3.0, promedio: 555, costoTotal: 37900 }
  ],
  
  // Datos de categorías para gráfico de torta
  categoryData: [
    { name: "Electrónica", value: 35, percent: 0.35 },
    { name: "Textil", value: 25, percent: 0.25 },
    { name: "Alimentos", value: 15, percent: 0.15 },
    { name: "Automotriz", value: 12, percent: 0.12 },
    { name: "Farmacéutica", value: 8, percent: 0.08 },
    { name: "Otros", value: 5, percent: 0.05 }
  ],
  
  // Datos de regiones para mapa y gráfico de torta regional
  regionData: [
    { name: "América del Norte", value: 40, fill: "#4361ee" },
    { name: "Europa", value: 27, fill: "#3a0ca3" },
    { name: "Asia", value: 20, fill: "#7209b7" },
    { name: "Sudamérica", value: 8, fill: "#f72585" },
    { name: "Oceanía", value: 3, fill: "#4cc9f0" },
    { name: "África", value: 2, fill: "#f15bb5" }
  ],
  
  // Datos de métodos de transporte
  transportData: [
    { name: "Marítimo", eficiencia: 85 },
    { name: "Aéreo", eficiencia: 92 },
    { name: "Terrestre", eficiencia: 78 },
    { name: "Multimodal", eficiencia: 88 }
  ],
  
  // Datos de clientes principales
  topClientes: [
    { name: "TechCorp Inc.", envios: 145, valor: 82500 },
    { name: "Global Foods S.A.", envios: 98, valor: 54300 },
    { name: "Farmacéutica EVA", envios: 76, valor: 48700 },
    { name: "Textiles del Sur", envios: 65, valor: 36900 },
    { name: "AutoPartes Express", envios: 58, valor: 33200 }
  ],
  
  // Datos de actividad reciente
  actividadReciente: [
    { id: "ACT001", tipo: "Exportación", destino: "Estados Unidos", fecha: "2023-12-10", estado: "Completado", valor: 12500 },
    { id: "ACT002", tipo: "Importación", origen: "China", fecha: "2023-12-09", estado: "En tránsito", valor: 8700 },
    { id: "ACT003", tipo: "Exportación", destino: "Brasil", fecha: "2023-12-08", estado: "En aduana", valor: 5600 },
    { id: "ACT004", tipo: "Exportación", destino: "España", fecha: "2023-12-07", estado: "Completado", valor: 9300 },
    { id: "ACT005", tipo: "Importación", origen: "Alemania", fecha: "2023-12-06", estado: "Completado", valor: 11200 }
  ]
};

// Datos de ejemplo para los gráficos

export const mockPerformanceData = [
  { name: 'Lun', value: 65 },
  { name: 'Mar', value: 59 },
  { name: 'Mié', value: 80 },
  { name: 'Jue', value: 81 },
  { name: 'Vie', value: 56 },
  { name: 'Sáb', value: 55 },
  { name: 'Dom', value: 40 }
];

export const mockActivityData = [
  { name: 'Lun', value: 12 },
  { name: 'Mar', value: 19 },
  { name: 'Mié', value: 23 },
  { name: 'Jue', value: 34 },
  { name: 'Vie', value: 39 },
  { name: 'Sáb', value: 10 },
  { name: 'Dom', value: 8 }
];

// Datos filtrados para diferentes rangos de tiempo
export const getFilteredDataByRange = (days: number) => {
  // Para una aplicación real, aquí filtraríamos los datos según el rango de días
  // En este caso solo cambiamos ligeramente los valores para simular diferencias
  
  const multiplier = days === 7 ? 1 : days === 14 ? 1.2 : 1.5;
  
  return {
    performanceData: mockPerformanceData.map(item => ({
      ...item,
      value: Math.round(item.value * multiplier)
    })),
    activityData: mockActivityData.map(item => ({
      ...item,
      value: Math.round(item.value * multiplier)
    }))
  };
}; 