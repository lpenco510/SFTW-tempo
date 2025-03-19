import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  ArrowDownToLine,
  ArrowUpToLine,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/theme-provider";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function FloatingDock() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      stagePadding: 4,
      steps: [
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
      ],
    });

    driverObj.drive();
  };

  const items = [
    { title: "Dashboard", icon: <Home className="h-4 w-4" />, href: "/" },
    {
      title: "Import",
      icon: <ArrowDownToLine className="h-4 w-4" />,
      href: "/comex/general",
    },
    {
      title: "Export",
      icon: <ArrowUpToLine className="h-4 w-4" />,
      href: "/comex/exports",
    },
    {
      title: "Settings",
      icon: <Settings className="h-4 w-4" />,
      href: "/configuracion",
    },
    {
      title: "Help",
      icon: <HelpCircle className="h-4 w-4" />,
      onClick: startTour,
    },
    {
      title: theme === "light" ? "Dark Mode" : "Light Mode",
      icon: theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />,
      href: "#",
      onClick: toggleTheme,
    },
  ];

  return (
    <>
      <FloatingDockDesktop
        items={items}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      />
      <FloatingDockMobile
        items={items}
        className="fixed bottom-6 right-6 z-50"
      />
    </>
  );
}

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
  }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="h-10 w-10 rounded-full bg-gray-50 dark:bg-[#161f31] flex items-center justify-center text-gray-700 dark:text-gray-200"
                  >
                    {item.icon}
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    className="h-10 w-10 rounded-full bg-gray-50 dark:bg-[#161f31] flex items-center justify-center text-gray-700 dark:text-gray-200"
                  >
                    {item.icon}
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="h-10 w-10 rounded-full bg-gray-50 dark:bg-[#161f31] flex items-center justify-center text-gray-700 dark:text-gray-200"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
  }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden md:flex h-16 items-end rounded-2xl bg-gray-50 dark:bg-[#161f31] px-4 pb-3",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer
          mouseX={mouseX}
          key={item.title}
          {...item}
          onClick={item.onClick}
        />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let height = useSpring(heightSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <>
      {onClick ? (
        <button onClick={onClick}>
          <motion.div
            ref={ref}
            style={{ width, height }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="mx-2 aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center relative text-gray-700 dark:text-gray-200"
          >
            <AnimatePresence>
              {hovered && (
                <motion.span
                  initial={{ opacity: 0, y: 10, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 2, x: "-50%" }}
                  className="absolute left-1/2 -top-8 px-2 py-1 rounded-md bg-gray-100 dark:bg-[#161f31] text-xs whitespace-nowrap"
                >
                  {title}
                </motion.span>
              )}
            </AnimatePresence>
            <motion.div
              style={{ scale: useTransform(distance, [-150, 0, 150], [1, 1.5, 1]) }}
              className="flex items-center justify-center"
            >
              {icon}
            </motion.div>
          </motion.div>
        </button>
      ) : (
        <Link to={href || "#"}>
          <motion.div
            ref={ref}
            style={{ width, height }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="mx-2 aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center relative text-gray-700 dark:text-gray-200"
          >
            <AnimatePresence>
              {hovered && (
                <motion.span
                  initial={{ opacity: 0, y: 10, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 2, x: "-50%" }}
                  className="absolute left-1/2 -top-8 px-2 py-1 rounded-md bg-gray-100 dark:bg-[#161f31] text-xs whitespace-nowrap"
                >
                  {title}
                </motion.span>
              )}
            </AnimatePresence>
            <motion.div
              style={{ scale: useTransform(distance, [-150, 0, 150], [1, 1.5, 1]) }}
              className="flex items-center justify-center"
            >
              {icon}
            </motion.div>
          </motion.div>
        </Link>
      )}
    </>
  );
}
