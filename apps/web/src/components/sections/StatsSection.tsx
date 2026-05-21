"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "9", label: "Analysis Modules", suffix: "" },
  { value: "40", label: "Technologies Detected", suffix: "+" },
  { value: "100", label: "Open Source", suffix: "%" },
  { value: "0", label: "Signup Required", suffix: "" },
];

export function StatsSection() {
  return (
    <section className="py-16 border-y border-slate-200 dark:border-surface-800 bg-white dark:bg-surface-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-black gradient-text mb-1">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
