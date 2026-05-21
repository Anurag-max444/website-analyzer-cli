"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeSite } from "@/lib/api";
import type { ScanResult, ScanStatus, ModuleName } from "@/types";
import { OverallScore } from "@/components/results/OverallScore";
import { ModuleGrid } from "@/components/results/ModuleGrid";
import { TechStackCard } from "@/components/results/TechStackCard";
import { ScanMeta } from "@/components/results/ScanMeta";
import { ResultsToolbar } from "@/components/results/ResultsToolbar";
import { ModuleFilter } from "@/components/results/ModuleFilter";
import { formatUrl } from "@/lib/utils";

export default function AnalyzePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url") || "";

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<ModuleName | "all">("all");

  const runAnalysis = useCallback(async () => {
    if (!url) { router.push("/"); return; }
    setStatus("loading");
    setError("");
    setResult(null);
    setActiveFilter("all");

    try {
      const data = await analyzeSite({ url, noLinks: false, lang: "en" });
      setResult(data);
      setStatus("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStatus("error");
    }
  }, [url, router]);

  useEffect(() => { 
    if (url) runAnalysis(); 
  }, [url]);

  // Module scores for filter badges
  const moduleScores = result
    ? Object.fromEntries(
        Object.entries(result.modules).map(([k, v]) => [k, v?.percentage || 0])
      ) as Partial<Record<ModuleName, number>>
    : undefined;

  // Filtered modules
  const filteredModules = result?.modules
    ? activeFilter === "all"
      ? result.modules
      : Object.fromEntries(
          Object.entries(result.modules).filter(([k]) => k === activeFilter)
        ) as typeof result.modules
    : undefined;

  // ── Loading ──
  if (status === "loading" || status === "idle") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm px-4"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-brand-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-brand-500/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Analyzing Website</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Running all 9 analyzers on</p>
          <code className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-surface-800 text-brand-500 font-mono break-all">
            {formatUrl(url)}
          </code>
          <div className="mt-6 flex flex-col gap-1.5">
            {[
              "Fetching page...",
              "Running SEO analysis...",
              "Checking security headers...",
              "Detecting tech stack...",
              "Validating sitemap & robots.txt...",
            ].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.7 }}
                className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2 justify-center"
              >
                <span className="w-1 h-1 rounded-full bg-brand-400 animate-pulse" />
                {step}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Error ──
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={runAnalysis} className="btn-primary">
              <Loader2 className="w-4 h-4" /> Try Again
            </button>
            <Link href="/" className="btn-secondary">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!result) return null;

  // ── Success ──
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] py-8 print:bg-white print:py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top bar — back + toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 no-print"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Analyze another site
          </Link>

          <ResultsToolbar
            url={url}
            onReanalyze={runAnalysis}
            isLoading={status === "loading"}
          />
        </motion.div>

        {/* Scan meta */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <ScanMeta meta={result.meta} />
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <OverallScore summary={result.summary} />
        </motion.div>

        {/* Tech Stack */}
        <AnimatePresence>
          {result.techStack?.count > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8"
            >
              <TechStackCard techStack={result.techStack} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 no-print"
        >
          <ModuleFilter
            active={activeFilter}
            onChange={setActiveFilter}
            scores={moduleScores}
          />
        </motion.div>

        {/* Module Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {filteredModules && <ModuleGrid modules={filteredModules} />}
        </motion.div>

        {/* Print footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-slate-200 text-sm text-slate-400 text-center">
          Generated by SiteScope — sitescope.dev | {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
