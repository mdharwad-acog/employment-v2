import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getAllocationBand(allocation: number): {
  label: string;
  color: string;
} {
  if (allocation === 100)
    return { label: "Fully Allocated", color: "text-green-600" };
  if (allocation >= 75) return { label: "High", color: "text-blue-600" };
  if (allocation >= 50) return { label: "Medium", color: "text-yellow-600" };
  if (allocation >= 25) return { label: "Low", color: "text-orange-600" };
  return { label: "Bench", color: "text-red-600" };
}
