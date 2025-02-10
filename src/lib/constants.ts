export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PREMIUM: "premium",
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  OPERATOR: "operator",
  VIEWER: "viewer",
} as const;

export const MENU_ITEMS = {
  FREE: [
    { label: "Inicio", path: "/", icon: "Home" },
    { label: "Productos", path: "/products", icon: "Package" },
    { label: "Proveedores", path: "/suppliers", icon: "Users" },
    {
      label: "COMEX",
      icon: "Globe",
      children: [
        { label: "Régimen General", path: "/comex/general" },
        { label: "Courier", path: "/comex/courier" },
        { label: "Exportaciones", path: "/comex/exports" },
      ],
    },
    { label: "Ayuda", path: "/help", icon: "HelpCircle" },
    { label: "Feedback", path: "/feedback", icon: "MessageSquare" },
    { label: "Configuración", path: "/settings", icon: "Settings" },
  ],
  PREMIUM: [
    { label: "Inicio", path: "/", icon: "Home" },
    { label: "Productos", path: "/products", icon: "Package" },
    { label: "Proveedores", path: "/suppliers", icon: "Users" },
    {
      label: "COMEX",
      icon: "Globe",
      children: [
        { label: "Régimen General", path: "/comex/general" },
        { label: "Courier", path: "/comex/courier" },
        { label: "Exportaciones", path: "/comex/exports" },
      ],
    },
    {
      label: "Análisis",
      icon: "BarChart2",
      children: [
        { label: "Inventario", path: "/analysis/inventory" },
        { label: "Liquidación IVA", path: "/analysis/iva" },
        { label: "Análisis", path: "/analysis/reports" },
      ],
    },
    { label: "Ayuda", path: "/help", icon: "HelpCircle" },
    { label: "Feedback", path: "/feedback", icon: "MessageSquare" },
    { label: "Configuración", path: "/settings", icon: "Settings" },
  ],
} as const;
