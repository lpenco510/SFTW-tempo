import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { signOut } from "@/lib/auth";
import { useCompanySettings } from "@/hooks/useCompanySettings";
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
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = "" }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { settings, loading } = useCompanySettings();

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

  return (
    <motion.div
      className={cn(
        "flex flex-col h-screen border-r bg-background relative group",
        className
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Logo Section */}
      <div className="h-16 border-b flex items-center px-4">
        <div className="w-full flex items-center gap-3">
          {!loading && (
            <img
              src={settings.logoUrl}
              alt={settings.companyName}
              className={cn(
                "object-contain transition-all duration-300",
                isExpanded ? "h-8 w-8" : "h-10 w-10"
              )}
            />
          )}
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.span
                className="font-semibold text-lg truncate"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
              >
                {settings.companyName}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-3 py-6">
        <nav className="space-y-6">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="h-5 px-4">
                <AnimatePresence>
                  {isExpanded && (
                    <motion.h2
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      {group.title}
                    </motion.h2>
                  )}
                </AnimatePresence>
              </div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg",
                    "hover:bg-accent hover:text-accent-foreground transition-colors",
                    "group relative"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!isExpanded && (
                    <div className="absolute left-full pl-2 ml-1 hidden group-hover:block z-50">
                      <div className="bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-md whitespace-nowrap">
                        {item.label}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="p-4 border-t space-y-2">
        {bottomMenuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm rounded-lg",
              "hover:bg-accent hover:text-accent-foreground transition-colors",
              "group relative"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.span
                    className="block truncate"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>
        ))}

        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm rounded-lg cursor-pointer",
            "text-red-500 hover:text-red-600 hover:bg-red-50/50 transition-colors",
            "group relative"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.span
                  className="block truncate"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Cerrar Sesión
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
