// src/components/ui/textarea.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s/g, "-")}`;

    return (
      <div className="w-full group">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-widest mb-2 text-muted-foreground group-focus-within:text-primary transition-colors"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[100px] w-full rounded-xl border-2 border-border bg-background/50 px-4 py-3 text-base sm:text-sm",
            "placeholder:text-muted-foreground/60",
            "focus:outline-none focus:border-primary focus:bg-background focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200 resize-none",
            "hover:border-muted-foreground/30",
            error && "border-destructive focus:border-destructive focus:shadow-[0_0_0_4px_hsl(var(--destructive)/0.1)]",
            className
          )}
          ref={ref}
          {...props}
        />
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

Textarea.displayName = "Textarea";

export { Textarea };
