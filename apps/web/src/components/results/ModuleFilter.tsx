"use client";

import { Search, Zap, Shield, Eye, Link, Map, Bot, Code2, LayoutGrid } from "lucide-react";
import { ModuleName } from "@/types";
import { cn } from "@/lib/utils";

const FILTERS: { key: ModuleName | "all"; label: string; icon: React.ElementType }[] = [
  { key: "all",           label: "All",           icon: LayoutGrid },
  { key: "seo",           label: "SEO",            icon: Search },
  { key: "performance",   label: "Performance",    icon: Zap },
  { key: "security",      label: "Security",       icon: Shield },
  { key: "accessibility", label: "Accessibility",  icon: Eye },
  { key: "links",         label: "Links",          icon: Link },
  { key: "sitemap",       label: "Sitemap",        icon: Map },
  { key: "robots",        label: "Robots",         icon: Bot },
  { key: "schema",        label: "Schema",         icon: Code2 },
];

interface Props {
  active: ModuleName | "all";
  onChange: (key: ModuleName | "all") => void;
  scores?: Partial<Record<ModuleName, number>>;
}

export function ModuleFilter({ active, onChange, scores }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {FILTERS.map(({ key, label, icon: Icon }) => {
        const score = key !== "all" ? scores?.[key] : undefined;
        const isActive = active === key;

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border",
              isActive
                ? "bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/20"
                : "bg-white dark:bg-surface-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-surface-700 hover:border-brand-400/50 hover:text-brand-500 dark:hover:text-brand-400"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {score !== undefined && (
              <span className={cn(
                "px-1.5 py-0.5 rounded text-xs font-bold",
                isActive
                  ? "bg-white/20 text-white"
                  : score >= 75
                    ? "text-emerald-500"
                    : score >= 50
                      ? "text-amber-500"
                      : "text-red-500"
              )}>
                {score}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
