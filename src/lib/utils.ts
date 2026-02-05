// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind's merge functionality.
 * This enables more efficient conditional classes and prevents
 * Tailwind class conflicts.
 *
 * Example usage:
 * cn("text-red-500", isActive && "bg-blue-500", "p-4")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency using Intl.NumberFormat.
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    // Fallback for environments that might not support Intl well or invalid options
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Formats a date string or Date object using Intl.DateTimeFormat.
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  locale: string = "en-US"
): string {
  try {
    const dateToFormat = date instanceof Date ? date : new Date(date);
    if (isNaN(dateToFormat.getTime())) {
      // Handle invalid date input
      console.warn("Invalid date provided to formatDate:", date);
      return "Invalid Date";
    }
    return new Intl.DateTimeFormat(locale, options).format(dateToFormat);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

/**
 * Truncates text to a specified length and adds an ellipsis.
 * Ensures that truncation happens at a word boundary if possible within a reasonable limit.
 */
export function truncateText(
  text: string,
  maxLength: number,
  ellipsis: string = "..."
): string {
  if (typeof text !== "string" || text.length <= maxLength) {
    return text;
  }

  let truncated = text.slice(0, maxLength);

  // Try to truncate at the last space within the maxLength to avoid cutting words
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength / 2) {
    // Only if the space is not too early
    truncated = truncated.slice(0, lastSpace);
  }

  return truncated + ellipsis;
}

/**
 * Debounce function to limit the rate at which a function can fire.
 */
export function debounce<F extends (...args: unknown[]) => unknown>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      func(...args);
    }, wait);
  };
}

/**
 * Generates a simple random string ID.
 * For more robust unique IDs, consider libraries like `uuid` or `nanoid`.
 */
export function generateId(length: number = 8): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalizeFirstLetter(string: string): string {
  if (typeof string !== "string" || string.length === 0) {
    return "";
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Delays execution for a specified number of milliseconds.
 * Useful for simulating network latency or for UI effects.
 * @param ms - The number of milliseconds to wait.
 * @returns A Promise that resolves after the specified delay.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
