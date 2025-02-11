import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  PackageSearch,
  Ship,
  Sun,
  Moon,
  User2,
} from "lucide-react";
import { Link } from "react-router-dom";

interface IconContainerProps {
  mouseX: any;
  href?: string;
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

function IconContainer({ mouseX, href, title, icon, onClick }: IconContainerProps) {
  let distance = useMotionValue(0);
  let opacity = useTransform(distance, [-100, 0, 100], [0.3, 1, 0.3]);
  let scale = useTransform(distance, [-100, 0, 100], [0.8, 1, 0.8]);

  let ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    let rect = ref.current.getBoundingClientRect();
    let halfWidth = rect.width / 2;

    return mouseX.on("change", (latestX: number) => {
      if (!ref.current) return;
      let rect = ref.current.getBoundingClientRect();
      let centerX = rect.x + halfWidth;
      let distanceFromCenter = latestX - centerX;
      distance.set(distanceFromCenter);
    });
  }, [mouseX, distance]);

  return (
    <motion.div
      ref={ref}
      style={{
        opacity,
        scale,
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          {onClick ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClick}
              className="rounded-full"
            >
              {icon}
            </Button>
          ) : (
            <Link to={href || "#"}>
              <Button variant="ghost" size="icon" className="rounded-full">
                {icon}
              </Button>
            </Link>
          )}
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
}

export const FloatingDock = () => {
  const { theme, setTheme } = useTheme();

  const items = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/",
    },
    {
      title: "Importaciones",
      icon: <PackageSearch className="h-5 w-5" />,
      href: "/comex/general",
    },
    {
      title: "Exportaciones",
      icon: <Ship className="h-5 w-5" />,
      href: "/comex/exports",
    },
    {
      title: "Perfil",
      icon: <User2 className="h-5 w-5" />,
      href: "/configuracion",
    },
    {
      title: "Cambiar tema",
      icon: theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-slate-900" />
      ),
      onClick: () => setTheme(theme === "light" ? "dark" : "light"),
    },
  ];

  return (
    <TooltipProvider>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <FloatingDockDesktop
          items={items}
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xl border"
        />
        <FloatingDockMobile
          items={items}
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xl border"
        />
      </div>
    </TooltipProvider>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href?: string; onClick?: () => void }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto flex md:hidden h-16 gap-4 items-end rounded-full px-4 pb-3",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href?: string; onClick?: () => void }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden md:flex h-16 gap-4 items-end rounded-full px-4 pb-3",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};
