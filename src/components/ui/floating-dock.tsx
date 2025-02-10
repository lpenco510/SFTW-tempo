import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FloatingDockProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
  }>;
  className?: string;
}

export const FloatingDock = ({ items, className }: FloatingDockProps) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "fixed bottom-4 inset-x-0 mx-auto w-fit px-4 py-3",
        "bg-background/70 backdrop-blur-md rounded-full",
        "border border-border/50 shadow-lg",
        "flex items-center gap-4",
        className,
      )}
    >
      {items.map((item, idx) => (
        <motion.button
          key={item.id}
          className="relative p-3 rounded-full hover:bg-accent transition-colors"
          onHoverStart={() => setHoveredIndex(idx)}
          onHoverEnd={() => setHoveredIndex(null)}
          onClick={item.onClick}
        >
          <span className="relative z-10 text-muted-foreground">
            {item.icon}
          </span>
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -30 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-accent text-accent-foreground text-sm rounded whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      ))}
    </motion.div>
  );
};
