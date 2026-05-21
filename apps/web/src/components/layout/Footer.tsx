import Link from "next/link";
import { Zap, Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Analyzer", href: "/" },
    { label: "API", href: "/docs/api" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Blog", href: "/blog" },
    { label: "GitHub", href: "https://github.com/ayush/sitescope" },
    { label: "Status", href: "/status" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-surface-800 bg-white dark:bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main footer */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg">
                Site<span className="gradient-text">Scope</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Analyze any website for SEO, Performance, Security, and Accessibility. Free and open-source.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2">
              {[
                { icon: Github, href: "https://github.com/ayush/sitescope", label: "GitHub" },
                { icon: Twitter, href: "https://twitter.com/ayush", label: "Twitter" },
                { icon: Linkedin, href: "https://linkedin.com/in/ayush", label: "LinkedIn" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-800 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-slate-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} SiteScope by{" "}
            <a
              href="https://github.com/ayush"
              className="text-brand-500 hover:text-brand-400 transition-colors"
            >
              Ayush
            </a>
            . Open-source & free.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 dark:text-slate-500">
              Built with ❤️ on Cloudflare
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
