"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Globe, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const EXAMPLE_URLS = [
  "https://vercel.com",
  "https://github.com",
  "https://shopify.com",
  "https://notion.so",
];

export function HeroSection() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    let cleanUrl = url.trim();
    if (!cleanUrl) { setError("Please enter a URL"); return; }
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }

    try { new URL(cleanUrl); } catch {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    const encoded = encodeURIComponent(cleanUrl);
    router.push(`/analyze?url=${encoded}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-[#020617]" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border border-brand-500/30 bg-brand-500/10 text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
            Free during beta — no signup needed
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-balance">
            Analyze Any Website
            <br />
            <span className="gradient-text">In Seconds</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 text-balance"
        >
          SEO, Performance, Security, Accessibility, Tech Stack, Sitemap & more —
          all in one comprehensive report. Free & open-source.
        </motion.p>

        {/* Search form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-2xl border-2 bg-white dark:bg-surface-900 shadow-xl shadow-slate-200/50 dark:shadow-black/20 transition-all duration-200",
              error
                ? "border-red-400 dark:border-red-500"
                : "border-slate-200 dark:border-surface-700 focus-within:border-brand-500 dark:focus-within:border-brand-500"
            )}>
              {/* Globe icon */}
              <div className="pl-3 flex-shrink-0">
                <Globe className="w-5 h-5 text-slate-400" />
              </div>

              {/* Input */}
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                placeholder="Enter website URL... (e.g. google.com)"
                className="flex-1 bg-transparent py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none text-base"
                disabled={loading}
                autoComplete="off"
                spellCheck={false}
              />

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
                  loading
                    ? "bg-slate-100 dark:bg-surface-700 text-slate-400 cursor-not-allowed"
                    : "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
                )}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Search className="w-4 h-4" /> Analyze</>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="mt-2 ml-4 text-sm text-red-500">{error}</p>
            )}
          </form>

          {/* Example URLs */}
          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            <span className="text-xs text-slate-400">Try:</span>
            {EXAMPLE_URLS.map((exUrl) => (
              <button
                key={exUrl}
                onClick={() => setUrl(exUrl)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-surface-700 text-slate-500 dark:text-slate-400 hover:border-brand-400 hover:text-brand-500 dark:hover:text-brand-400 transition-all"
              >
                {exUrl.replace("https://", "")}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {[
            "SEO Analysis", "Performance", "Security Headers",
            "Accessibility", "Tech Stack", "Sitemap",
            "Robots.txt", "Schema Markup",
          ].map((feat) => (
            <span
              key={feat}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-surface-700"
            >
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              {feat}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
