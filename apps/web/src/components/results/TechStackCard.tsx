"use client";

import { TechStack } from "@/types";
import { Cpu } from "lucide-react";

interface Props { techStack: TechStack; }

export function TechStackCard({ techStack }: Props) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Cpu className="w-4.5 h-4.5 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-semibold">Tech Stack</h3>
          <p className="text-xs text-slate-400">{techStack.count} technologies detected</p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(techStack.grouped).map(([category, items]) => (
          <div key={category}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((tech) => (
                <span
                  key={tech.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-surface-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-surface-600"
                >
                  <span>{tech.icon}</span>
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
