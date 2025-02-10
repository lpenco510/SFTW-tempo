import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { signOut } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  Users,
  Globe,
  Truck,
  Plane,
  Ship,
  ClipboardList,
  Calculator,
  BarChart2,
  HelpCircle,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = "" }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const handleMouseEnter = () => setIsExpanded(true);
  const handleMouseLeave = () => setIsExpanded(false);

  const menuGroups = [
    {
      title: "Principal",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/" },
        { icon: Package, label: "Productos", href: "/productos" },
        { icon: Users, label: "Proveedores", href: "/proveedores" },
      ],
    },
    {
      title: "COMEX",
      icon: Globe,
      items: [
        { icon: Truck, label: "Régimen General", href: "/comex/general" },
        { icon: Plane, label: "Courier", href: "/comex/courier" },
        { icon: Ship, label: "Exportaciones", href: "/comex/exports" },
      ],
    },
    {
      title: "Análisis",
      icon: BarChart2,
      items: [
        {
          icon: ClipboardList,
          label: "Inventario",
          href: "/analisis/inventario",
        },
        { icon: Calculator, label: "Liquidación IVA", href: "/analisis/iva" },
        { icon: BarChart2, label: "Análisis", href: "/analisis/reportes" },
      ],
    },
  ];

  const bottomMenuItems = [
    { icon: HelpCircle, label: "Ayuda", href: "/ayuda" },
    { icon: MessageSquare, label: "Feedback", href: "/feedback" },
    { icon: Settings, label: "Configuración", href: "/configuracion" },
  ];

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      window.location.href = "/login";
    }
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    setActiveGroup(null);
  };

  return (
    <motion.div
      className={cn(
        "flex flex-col h-screen border-r bg-background relative",
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={false}
      animate={{
        width: isExpanded ? 280 : 80,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Logo Section */}
      <motion.div
        className="p-6 border-b flex items-center justify-center"
        animate={{ opacity: isExpanded ? 1 : 0.5 }}
      >
        <h1
          className={cn(
            "font-bold transition-all",
            isExpanded ? "text-2xl" : "text-xl",
          )}
        >
          {isExpanded ? "ARUSA Import" : "AI"}
        </h1>
      </motion.div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-3 py-6">
        <nav className="space-y-4">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {isExpanded && (
                <h2 className="px-4 text-xs font-semibold text-muted-foreground mb-2">
                  {group.title}
                </h2>
              )}
              {group.items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg",
                    "hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                    "relative overflow-hidden",
                  )}
                  onMouseEnter={() => setActiveGroup(group.title)}
                  onMouseLeave={() => setActiveGroup(null)}
                >
                  {item.icon && <item.icon className="w-5 h-5 shrink-0" />}
                  <motion.span
                    animate={{ opacity: isExpanded ? 1 : 0 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                  {!isExpanded && activeGroup === group.title && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute left-16 bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-md whitespace-nowrap z-50"
                    >
                      {item.label}
                    </motion.div>
                  )}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="p-4 border-t space-y-2">
        {bottomMenuItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm rounded-lg",
              "hover:bg-accent hover:text-accent-foreground transition-all duration-200",
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <motion.span
              animate={{ opacity: isExpanded ? 1 : 0 }}
              className="truncate"
            >
              {item.label}
            </motion.span>
          </a>
        ))}

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50",
            "mt-4",
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 shrink-0 mr-2" />
          <motion.span
            animate={{ opacity: isExpanded ? 1 : 0 }}
            className="truncate"
          >
            Cerrar Sesión
          </motion.span>
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
