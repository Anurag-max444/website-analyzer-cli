"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, AlertCircle, AlertTriangle, CheckCircle,
  Search, Zap, Shield, Eye, Link, Map, Bot, Code2,
} from "lucide-react";
import type { ModuleResult, ModuleName } from "@/types";
import { gradeColor, gradeClass, moduleName } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MODULE_ICONS: Record<string, React.ElementType> = {
  seo: Search, performance: Zap, security: Shield,
  accessibility: Eye, links: Link, sitemap: Map,
  robots: Bot, schema: Code2,
};

interface Props {
  modules: Partial<Record<ModuleName, ModuleResult>>;
}

export function ModuleGrid({ modules }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const entries = Object.entries(modules) as [ModuleName, ModuleResult][];

  if (entries.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-400">No module data available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">
        Module Results
        <span className="ml-2 text-sm font-normal text-slate-400">
          ({entries.length} module{entries.length !== 1 ? "s" : ""})
        </span>
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {entries.map(([key, mod], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <ModuleCard
              moduleKey={key}
              mod={mod}
              expanded={expanded === key}
              onToggle={() => setExpanded(expanded === key ? null : key)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ModuleCard({
  moduleKey, mod, expanded, onToggle,
}: {
  moduleKey: ModuleName;
  mod: ModuleResult;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = MODULE_ICONS[moduleKey] || Search;
  const color = gradeColor(mod.grade.letter);
  const issueCount = mod.issues?.length || 0;
  const warnCount = mod.warnings?.length || 0;
  const passCount = mod.passed?.length || 0;
  const hasDetails = issueCount + warnCount + passCount > 0;

  return (
    <div className={cn(
      "card overflow-hidden transition-all duration-200",
      expanded && "ring-1 ring-brand-500/30 shadow-lg shadow-brand-500/5"
    )}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-surface-700/30 transition-colors"
        disabled={!hasDetails}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>

        {/* Name + progress */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-sm truncate">{moduleName(moduleKey)}</span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full border font-semibold flex-shrink-0",
              gradeClass(mod.grade.letter)
            )}>
              {mod.grade.emoji} {mod.grade.letter}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-surface-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${mod.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          {/* Mini counts */}
          <div className="flex items-center gap-3 mt-1.5">
            {issueCount > 0 && (
              <span className="text-xs text-red-500 flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" />{issueCount}
              </span>
            )}
            {warnCount > 0 && (
              <span className="text-xs text-amber-500 flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />{warnCount}
              </span>
            )}
            {passCount > 0 && (
              <span className="text-xs text-emerald-500 flex items-center gap-0.5">
                <CheckCircle className="w-3 h-3" />{passCount}
              </span>
            )}
          </div>
        </div>

        {/* Score + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-2xl font-black" style={{ color }}>
            {mod.percentage}
          </span>
          {hasDetails && (
            <ChevronDown className={cn(
              "w-4 h-4 text-slate-400 transition-transform duration-200",
              expanded && "rotate-180"
            )} />
          )}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-4 border-t border-slate-100 dark:border-surface-700 space-y-4">

              {issueCount > 0 && (
                <ItemGroup
                  items={mod.issues}
                  icon={<AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />}
                  label="Issues — fix karo"
                  labelClass="text-red-500"
                  bgClass="bg-red-50 dark:bg-red-500/5"
                />
              )}

              {warnCount > 0 && (
                <ItemGroup
                  items={mod.warnings}
                  icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />}
                  label="Warnings"
                  labelClass="text-amber-500"
                  bgClass="bg-amber-50 dark:bg-amber-500/5"
                />
              )}

              {passCount > 0 && (
                <ItemGroup
                  items={mod.passed}
                  icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />}
                  label="Passed"
                  labelClass="text-emerald-500"
                  bgClass="bg-emerald-50 dark:bg-emerald-500/5"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemGroup({
  items, icon, label, labelClass, bgClass,
}: {
  items: { message: string }[];
  icon: React.ReactNode;
  label: string;
  labelClass: string;
  bgClass: string;
}) {
  return (
    <div className={cn("rounded-xl p-3", bgClass)}>
      <p className={cn("text-xs font-semibold mb-2", labelClass)}>{label}</p>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {icon}
            <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.message || ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
