"use client";

import { motion } from "framer-motion";
import { Search, Zap, Shield, Eye, Link, Map, Bot, Code2 } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "SEO Analysis",
    desc: "Title, meta description, OG tags, canonical, headings, schema markup and more.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: Zap,
    title: "Performance",
    desc: "Response time, compression, caching, HTTPS, render-blocking resources.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Shield,
    title: "Security",
    desc: "CSP, HSTS, X-Frame-Options, CORS, mixed content, server info leakage.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Eye,
    title: "Accessibility",
    desc: "Alt text, ARIA labels, form labels, heading hierarchy, zoom, landmarks.",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
  {
    icon: Link,
    title: "Link Checker",
    desc: "Broken links, redirects, internal vs external links, nofollow detection.",
    color: "text-brand-400",
    bg: "bg-brand-400/10",
  },
  {
    icon: Map,
    title: "Sitemap",
    desc: "Sitemap.xml detection, URL count, lastmod dates, HTTPS validation.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    icon: Bot,
    title: "Robots.txt",
    desc: "Crawl rules, sitemap reference, blocked paths, crawl-delay analysis.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    icon: Code2,
    title: "Tech Stack",
    desc: "Detect 40+ technologies — frameworks, CMS, analytics, hosting, CDN.",
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-[#020617]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Everything Your Website Needs
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            One tool, nine comprehensive analyzers. No signup, no limits during beta.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="card-hover p-6 group"
              >
                <div className={`w-10 h-10 rounded-xl ${feat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${feat.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
