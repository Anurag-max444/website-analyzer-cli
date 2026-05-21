"use client";

import { useState } from "react";
import { Share2, Copy, Check, RefreshCw, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  url: string;
  onReanalyze: () => void;
  isLoading?: boolean;
}

export function ResultsToolbar({ url, onReanalyze, isLoading }: Props) {
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // ── Copy share link ──
  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/analyze?url=${encodeURIComponent(url)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── PDF Export ──
  const handlePDFExport = async () => {
    setPdfLoading(true);
    try {
      // Browser print as PDF
      window.print();
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">

      {/* Re-analyze */}
      <button
        onClick={onReanalyze}
        disabled={isLoading}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
          "bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-300",
          "hover:bg-slate-200 dark:hover:bg-surface-700 border border-slate-200 dark:border-surface-700",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        Re-analyze
      </button>

      {/* Copy share link */}
      <button
        onClick={handleCopyLink}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
          "border",
          copied
            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
            : "bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-surface-700 hover:bg-slate-200 dark:hover:bg-surface-700"
        )}
      >
        {copied ? (
          <><Check className="w-4 h-4" /> Copied!</>
        ) : (
          <><Copy className="w-4 h-4" /> Copy Link</>
        )}
      </button>

      {/* PDF Export */}
      <button
        onClick={handlePDFExport}
        disabled={pdfLoading}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
          "bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/20",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {pdfLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export PDF
      </button>
    </div>
  );
}
