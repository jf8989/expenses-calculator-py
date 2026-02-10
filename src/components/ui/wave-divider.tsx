// src/components/ui/wave-divider.tsx
"use client";

import { cn } from "@/lib/utils";

interface WaveDividerProps {
  className?: string;
  flip?: boolean;
  color?: "muted" | "background" | "primary";
}

export function WaveDivider({ className, flip = false, color = "muted" }: WaveDividerProps) {
  const colorClasses = {
    muted: "fill-muted/30",
    background: "fill-background",
    primary: "fill-primary/5",
  };

  return (
    <div
      className={cn("w-full overflow-hidden leading-none", flip && "rotate-180", className)}
      aria-hidden="true"
    >
      <svg
        className={cn("relative block w-full h-12 sm:h-16 lg:h-20", colorClasses[color])}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
      </svg>
    </div>
  );
}
