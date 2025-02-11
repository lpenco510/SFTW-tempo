import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpToLine,
  User2,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "./button";
import { useTheme } from "@/lib/theme-provider";
import { Link } from "react-router-dom";

export function FloatingDock() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-full shadow-lg border flex items-center gap-2 z-50">
      <Link to="/">
        <Button variant="ghost" size="icon" className="rounded-full">
          <LayoutDashboard className="h-5 w-5" />
        </Button>
      </Link>

      <Link to="/comex/general">
        <Button variant="ghost" size="icon" className="rounded-full">
          <ArrowDownToLine className="h-5 w-5" />
        </Button>
      </Link>

      <Link to="/comex/exports">
        <Button variant="ghost" size="icon" className="rounded-full">
          <ArrowUpToLine className="h-5 w-5" />
        </Button>
      </Link>

      <Button variant="ghost" size="icon" className="rounded-full">
        <User2 className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
