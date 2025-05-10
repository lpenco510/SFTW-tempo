'use client'

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { signOut, getCurrentUser, isGuestUser, cleanStorage } from "@/lib/auth";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Globe,
  Truck,
  Plane,
  Ship,
  FileText,
  Timer,
  Calculator,
  BarChart2,
  LineChart,
  HelpCircle,
  MessageSquare,
  Settings,
  LogOut,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import useAuth from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = "" }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { settings, isLoading, refreshData: fetchCompanySettings } = useCompanySettings();
  const [isGuest, setIsGuest] = useState(false);
  const [guestData, setGuestData] = useState({ 
    name: 'IT CARGO', 
    logo: '/IT CARGO - GLOBAL - toditos-17.png' 
  });
  const [logoKey, setLogoKey] = useState(Date.now()); // Para forzar la recarga de la imagen
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkGuestStatus = async () => {
      try {
        console.log("Sidebar: Verificando estado de usuario invitado");
        const guestStatus = await isGuestUser();
        setIsGuest(guestStatus);
        
        if (guestStatus) {
          console.log("Sidebar: Usuario invitado detectado");
          const user = await getCurrentUser();
          if (user && user.user_metadata) {
            setGuestData({
              name: user.user_metadata.company_name || 'IT CARGO',
              logo: user.user_metadata.company_logo || '/IT CARGO - GLOBAL - toditos-17.png'
            });
            console.log("Sidebar: Datos de invitado cargados:", user.user_metadata);
          }
        } else {
          console.log("Sidebar: Usuario registrado detectado");
        }
      } catch (error) {
        console.error("Error verificando estado de invitado:", error);
      }
    };
    
    checkGuestStatus();
  }, []);

  useEffect(() => {
    const handleCompanyUpdate = (event: Event) => {
      console.log("Sidebar: Evento de actualización de empresa recibido", 
        (event as CustomEvent)?.detail);
      
      // Forzar actualización de datos y refresco de UI
      if (!isGuest) {
        setTimeout(() => {
          fetchCompanySettings();
          setLogoKey(Date.now()); // Forzar la recarga de la imagen
        }, 100);
      }
    };

    window.addEventListener('company-updated', handleCompanyUpdate);
    return () => window.removeEventListener('company-updated', handleCompanyUpdate);
  }, [fetchCompanySettings, isGuest]);

  if (isLoading && !isGuest) {
    return (
      <div className="flex h-screen w-20 bg-background border-r animate-pulse">
        <div className="w-full h-16 bg-gray-200" />
      </div>
    );
  }
  
  const menuGroups = [
    {
      title: "Principal",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/" },
      ],
    },
    {
      title: "Gestión de Inventario",
      items: [
        { icon: Package, label: "Productos", href: "/productos" },
        { icon: Boxes, label: "Inventario", href: "/inventario" },
      ],
    },
    {
      title: "Operaciones COMEX",
      icon: Globe,
      items: [
        { icon: Truck, label: "Régimen General", href: "/comex/general" },
        { icon: Plane, label: "Courier", href: "/comex/courier" },
        { icon: Ship, label: "Exportaciones", href: "/comex/exports" },
        { icon: FileText, label: "Gestión de Aduanas", href: "/comex/aduanas" },
        { icon: Timer, label: "Seguimiento de Envíos", href: "/comex/tracking" },
        { icon: DollarSign, label: "Tarifas y Costos", href: "/comex/tarifas" },
      ],
    },
    {
      title: "Finanzas y Análisis",
      icon: BarChart2,
      items: [
        { icon: Calculator, label: "Liquidación IVA", href: "/finanzas/iva" },
        { icon: BarChart2, label: "Análisis", href: "/finanzas/analisis" },
        { icon: LineChart, label: "Reportes Personalizados", href: "/finanzas/reportes" },
      ],
    },
  ];

  const bottomMenuItems = [
    { icon: HelpCircle, label: "Ayuda", href: "/ayuda" },
    { icon: MessageSquare, label: "Feedback", href: "/feedback" },
    { icon: Settings, label: "Configuración", href: "/configuracion" },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Error during logout:", error);
        toast({
          title: "Error al cerrar sesión",
          description: "Intente nuevamente o recargue la página",
          variant: "destructive"
        });
        
        // Try forceful cleanup if signOut failed
        cleanStorage();
      }
      
      // Add a small delay to ensure all cleanup is completed
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = "/login";
    } catch (e) {
      console.error("Exception during logout:", e);
      // Fallback - force reload to login page
      window.location.href = "/login?forceClear=true";
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Logo Section
  const logoUrl = isGuest 
    ? guestData.logo 
    : (settings?.logo_url || '/default-logo.png');
    
  const companyName = isGuest
    ? guestData.name
    : (settings?.name || settings?.nombre_empresa || "IT CARGO");

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
          <img
            src={`${logoUrl}?v=${logoKey}`}
            alt={companyName}
            className={cn(
              "object-contain transition-all duration-300",
              isExpanded ? "h-8 w-8" : "h-10 w-10"
            )}
          />
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.span
                className="font-semibold text-lg truncate"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                style={isGuest ? { 
                  fontFamily: "'Helvetica Now Display', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontWeight: 800
                } : {}}
              >
                {companyName}
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