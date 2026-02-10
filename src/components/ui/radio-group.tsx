// src/components/ui/radio-group.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  disabled = false,
  error,
}: RadioGroupProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <div key={option.value} className="flex items-start gap-3">
          <div className="flex items-center h-6">
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={disabled}
              className="sr-only peer"
            />
            <motion.label
              htmlFor={`${name}-${option.value}`}
              whileHover={{ scale: disabled ? 1 : 1.05 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors",
                value === option.value
                  ? "border-primary"
                  : error
                    ? "border-red-500 hover:border-red-600"
                    : "border-muted-foreground/30 hover:border-primary/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {value === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-2.5 h-2.5 rounded-full bg-primary"
                />
              )}
            </motion.label>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`${name}-${option.value}`}
              className={cn(
                "text-sm font-medium leading-none cursor-pointer",
                disabled && "opacity-70",
                error && "text-red-500"
              )}
            >
              {option.label}
            </label>
            {option.description && (
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
            )}
          </div>
        </div>
      ))}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
