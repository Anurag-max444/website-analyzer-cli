import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { GradeLetter } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Grade → CSS class
export function gradeClass(letter: GradeLetter): string {
  const map: Record<GradeLetter, string> = {
    A: "grade-a",
    B: "grade-b",
    C: "grade-c",
    D: "grade-d",
    F: "grade-f",
  };
  return map[letter] || "grade-f";
}

// Grade → color for charts
export function gradeColor(letter: GradeLetter): string {
  const map: Record<GradeLetter, string> = {
    A: "#10b981",
    B: "#0ea5e9",
    C: "#f59e0b",
    D: "#f97316",
    F: "#ef4444",
  };
  return map[letter] || "#ef4444";
}

// Grade → bg color
export function gradeBg(letter: GradeLetter): string {
  const map: Record<GradeLetter, string> = {
    A: "bg-emerald-500",
    B: "bg-brand-500",
    C: "bg-amber-500",
    D: "bg-orange-500",
    F: "bg-red-500",
  };
  return map[letter] || "bg-red-500";
}

// Module → icon name (lucide)
export function moduleIcon(module: string): string {
  const map: Record<string, string> = {
    seo: "Search",
    performance: "Zap",
    security: "Shield",
    accessibility: "Eye",
    links: "Link",
    sitemap: "Map",
    robots: "Bot",
    schema: "Code2",
  };
  return map[module] || "Circle";
}

// Module → display name
export function moduleName(module: string): string {
  const map: Record<string, string> = {
    seo: "SEO",
    performance: "Performance",
    security: "Security",
    accessibility: "Accessibility",
    links: "Links",
    sitemap: "Sitemap",
    robots: "Robots.txt",
    schema: "Schema",
  };
  return map[module] || module;
}

// Format URL for display
export function formatUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
  } catch {
    return url;
  }
}

// Format ms to readable
export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// Format date
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
