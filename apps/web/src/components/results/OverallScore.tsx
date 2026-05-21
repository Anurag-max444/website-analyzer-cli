"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { ScanSummary } from "@/types";
import { gradeColor, gradeClass, formatUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle, BarChart2 } from "lucide-react";

interface Props { summary: ScanSummary; }

export function OverallScore({ summary }: Props) {
  const { overall, totalIssues, totalWarnings, totalPassed } = summary;
  const g = overall.grade;
  const color = gradeColor(g.letter);

  const chartData = [{ value: overall.percentage, fill: color }];

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center gap-8">

        {/* Radial chart */}
        <div className="relative flex-shrink-0 w-44 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="70%" outerRadius="100%"
              data={chartData}
              startAngle={90} endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                background={{ fill: "#1e293b" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black" style={{ color }}>
              {overall.percentage}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 w-full">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black mb-1">Overall Score</h2>
              <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border", gradeClass(g.letter))}>
                {g.emoji} Grade {g.letter} — {g.label}
              </span>
            </div>
            <BarChart2 className="w-5 h-5 text-slate-400" />
          </div>

          {/* Score bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Score</span>
              <span className="font-mono font-medium">{overall.score} / {overall.maxScore}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-surface-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${overall.percentage}%`, backgroundColor: color }}
              />
            </div>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-xl font-bold text-red-500">{totalIssues}</span>
              </div>
              <span className="text-xs text-red-500/80 font-medium">Issues</span>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xl font-bold text-amber-500">{totalWarnings}</span>
              </div>
              <span className="text-xs text-amber-500/80 font-medium">Warnings</span>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xl font-bold text-emerald-500">{totalPassed}</span>
              </div>
              <span className="text-xs text-emerald-500/80 font-medium">Passed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
