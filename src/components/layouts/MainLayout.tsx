import React from "react";
import Sidebar from "../dashboard/Sidebar";
import { FloatingDock } from "@/components/ui/floating-dock";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="h-full" />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <FloatingDock />
    </div>
  );
}