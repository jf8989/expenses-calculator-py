// src/components/ui/input.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const inputId = id || `input-${typeof label === 'string' ? label.toLowerCase().replace(/\s/g, "-") : Math.random().toString(36).substring(7)}`;

    return (
      <div className="w-full group">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-widest mb-2 text-muted-foreground group-focus-within:text-primary transition-colors"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            id={inputId}
            className={cn(
              "flex h-12 w-full rounded-xl border-2 border-border bg-background/50 px-4 py-2 text-base sm:text-sm",
              "placeholder:text-muted-foreground/60",
              "focus:outline-none focus:border-primary focus:bg-background focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              "hover:border-muted-foreground/30",
              error && "border-destructive focus:border-destructive focus:shadow-[0_0_0_4px_hsl(var(--destructive)/0.1)]",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-destructive flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
