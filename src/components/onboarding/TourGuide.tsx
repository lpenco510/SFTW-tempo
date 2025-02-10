import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "@/components/ui/button";

export function TourGuide() {
  const [showTour, setShowTour] = useState(true);

  const steps = [
    {
      element: '[data-tour="summary-widgets"]',
      popover: {
        title: "Resumen del Dashboard",
        description:
          "Aquí encontrarás un resumen de todas tus operaciones activas, valores totales y métricas importantes.",
        side: "bottom",
      },
    },
    {
      element: '[data-tour="quick-actions"]',
      popover: {
        title: "Acciones Rápidas",
        description:
          "Inicia nuevas importaciones o exportaciones rápidamente desde aquí.",
        side: "bottom",
      },
    },
    {
      element: '[data-tour="trends-charts"]',
      popover: {
        title: "Gráficos de Tendencias",
        description:
          "Visualiza las tendencias de tus operaciones de importación y exportación.",
        side: "top",
      },
    },
    {
      element: '[data-tour="activity-table"]',
      popover: {
        title: "Tabla de Actividades",
        description:
          "Revisa todas tus operaciones recientes y su estado actual.",
        side: "top",
      },
    },
    {
      element: '[data-tour="sidebar"]',
      popover: {
        title: "Navegación Principal",
        description:
          "Accede a todas las funciones del sistema desde este menú.",
        side: "right",
      },
    },
  ];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (!hasSeenTour && showTour) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        stagePadding: 4,
        steps: steps,
      });

      driverObj.drive();
      localStorage.setItem("hasSeenTour", "true");
      setShowTour(false);
    }
  }, []);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      stagePadding: 4,
      steps: steps,
    });

    driverObj.drive();
    localStorage.setItem("hasSeenTour", "true");
    setShowTour(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="default" onClick={startTour} className="shadow-lg">
        Iniciar Tour
      </Button>
    </div>
  );
}
