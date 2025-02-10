import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { signOut } from "@/lib/auth";
import {
  LayoutDashboard,
  Ship,
  FileText,
  AlertCircle,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = "" }: SidebarProps) => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "#" },
    { icon: Ship, label: "Shipments", href: "#" },
    { icon: FileText, label: "Documents", href: "#" },
    { icon: AlertCircle, label: "Alerts", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      window.location.href = "/login";
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen w-[280px] border-r bg-background",
        className,
      )}
    >
      {/* Logo Section */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold">ARUSA Import</h1>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </a>
          ))}
        </nav>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <Button className="w-full mb-4" variant="default">
          <Plus className="w-4 h-4 mr-2" />
          New Import
        </Button>
        <Button className="w-full mb-4" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          New Export
        </Button>
      </div>

      {/* User Actions */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
