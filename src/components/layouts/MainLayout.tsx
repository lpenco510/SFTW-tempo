import React from "react";
import Sidebar from "../dashboard/Sidebar";
import { FloatingDock } from "@/components/ui/floating-dock";
import ConnectionMonitor from "../utils/ConnectionMonitor";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-1 pt-2 pb-2 md:px-6 md:pt-4 md:pb-4 relative">
          {children}
          <ConnectionMonitor showStatus={true} interval={120000} />
        </main>
      </div>
      <FloatingDock />
    </div>
  );
}