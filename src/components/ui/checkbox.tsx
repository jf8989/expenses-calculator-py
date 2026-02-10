// src/components/ui/checkbox.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CheckboxProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: CheckboxProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center h-6">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <motion.label
          htmlFor={id}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          className={cn(
            "h-5 w-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors",
            checked
              ? "bg-primary border-primary"
              : "border-muted-foreground/30 hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {checked && (
            <motion.svg
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-3 h-3 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          )}
        </motion.label>
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            disabled && "opacity-70"
          )}
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
