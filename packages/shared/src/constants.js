/**
 * Shared Constants
 * Used by: core, cli, api, web
 */

// All supported modules
const MODULES = [
  "seo",
  "performance",
  "security",
  "accessibility",
  "links",
  "sitemap",
  "robots",
  "schema",
];

// Tech stack categories
const TECH_CATEGORIES = [
  "Framework",
  "CMS",
  "E-Commerce",
  "Website Builder",
  "CSS Framework",
  "Analytics",
  "Hosting",
  "CDN/Proxy",
  "Server",
  "Library",
  "Animation",
  "3D",
  "Charts",
  "Payments",
  "Chat",
];

// Credit costs per scan type
const CREDIT_COSTS = {
  basic: 1,      // SEO + Performance only
  full: 2,       // All modules
  ai: 5,         // AI recommendations (future)
};

// API limits
const API_LIMITS = {
  freeCredits: 20,        // Beta free credits
  maxUrlLength: 2048,
  maxConcurrentLinks: 5,
  maxLinksPerScan: 30,
  requestTimeout: 15000,  // 15s
  sitemapTimeout: 8000,   // 8s
};

// Supported languages
const SUPPORTED_LANGS = ["en", "hi"];

// Default options
const DEFAULTS = {
  lang: "en",
  exportFormat: "html",
  maxLinks: 30,
  timeout: 15000,
  concurrency: 5,
};

// Tool info
const TOOL_INFO = {
  name: "website-analyzer",
  version: "1.0.0",
  description: "Analyze any website — SEO, Performance, Security, Accessibility & more",
  github: "https://github.com/website-analyzer",
};

module.exports = {
  MODULES,
  TECH_CATEGORIES,
  CREDIT_COSTS,
  API_LIMITS,
  SUPPORTED_LANGS,
  DEFAULTS,
  TOOL_INFO,
};
