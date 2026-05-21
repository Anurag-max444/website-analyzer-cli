/**
 * Standard Response Formatter
 * Converts all analyzer results into one clean, API-ready format
 *
 * Every API response will look like:
 * {
 *   success: true,
 *   meta: { url, scannedAt, responseTime, version },
 *   summary: { overall, grade, totalIssues, totalWarnings },
 *   modules: { seo, performance, security, ... },
 *   techStack: { ... }
 * }
 */

const pkg = require("../../package.json");


// ─────────────────────────────────────────
// GRADE SYSTEM (shared)
// ─────────────────────────────────────────

const { GRADES, getGrade, MODULES: SHARED_MODULES } = require('@website-analyzer/shared');

// ─────────────────────────────────────────
// MODULE NAMES (all supported)
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// MAIN FORMAT FUNCTION
// ─────────────────────────────────────────

/**
 * Format raw analyzer results into standard API response
 * @param {string} url - Analyzed URL
 * @param {object} results - Raw results from src/index.js
 * @param {object} options - { responseTime, lang, requestId }
 * @returns {object} - Standard formatted response
 */
function formatResponse(url, results, options = {}) {
  const {
    responseTime = 0,
    lang = "en",
    requestId = generateRequestId(),
  } = options;

  // ── Summary calculate karo ──
  const summary = buildSummary(results);

  // ── Modules format karo ──
  const modules = {};
  MODULES.forEach((name) => {
    if (results[name]) {
      modules[name] = formatModule(name, results[name]);
    }
  });

  return {
    success: true,
    requestId,
    meta: {
      url,
      scannedAt: new Date().toISOString(),
      responseTime,
      lang,
      version: pkg.version,
      tool: "website-analyzer-cli",
    },
    summary,
    modules,
    techStack: formatTechStack(results.techStack),
  };
}

// ─────────────────────────────────────────
// ERROR RESPONSE
// ─────────────────────────────────────────

function formatError(url, error, options = {}) {
  const { requestId = generateRequestId(), lang = "en" } = options;

  return {
    success: false,
    requestId,
    meta: {
      url,
      scannedAt: new Date().toISOString(),
      lang,
      version: pkg.version,
      tool: "website-analyzer-cli",
    },
    error: {
      message: error.message || "Unknown error",
      code: error.code || "UNKNOWN_ERROR",
      type: classifyError(error),
    },
  };
}

// ─────────────────────────────────────────
// SUMMARY BUILDER
// ─────────────────────────────────────────

function buildSummary(results) {
  let totalScore = 0;
  let totalMax = 0;
  let totalIssues = 0;
  let totalWarnings = 0;
  const moduleScores = {};

  MODULES.forEach((name) => {
    const mod = results[name];
    if (!mod) return;

    totalScore += mod.score || 0;
    totalMax += mod.maxScore || 0;
    totalIssues += (mod.issues || []).length;
    totalWarnings += (mod.warnings || []).length;

    const pct = mod.percentage || 0;
    moduleScores[name] = {
      percentage: pct,
      grade: mod.grade?.letter || "F",
    };
  });

  const overallPercentage =
    totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  const overallGrade = getGrade(overallPercentage);

  // Weakest module dhundo
  const weakest = Object.entries(moduleScores)
    .sort(([, a], [, b]) => a.percentage - b.percentage)
    .map(([name]) => name)[0] || null;

  // Strongest module dhundo
  const strongest = Object.entries(moduleScores)
    .sort(([, a], [, b]) => b.percentage - a.percentage)
    .map(([name]) => name)[0] || null;

  return {
    overall: {
      score: totalScore,
      maxScore: totalMax,
      percentage: overallPercentage,
      grade: overallGrade,
    },
    totalIssues,
    totalWarnings,
    totalPassed: MODULES.reduce((acc, name) => {
      return acc + ((results[name]?.passed || []).length);
    }, 0),
    modulesScanned: Object.keys(moduleScores).length,
    weakest,
    strongest,
    moduleScores,
  };
}

// ─────────────────────────────────────────
// MODULE FORMATTER
// ─────────────────────────────────────────

function formatModule(name, mod) {
  if (!mod) return null;

  return {
    score: mod.score || 0,
    maxScore: mod.maxScore || 0,
    percentage: mod.percentage || 0,
    grade: mod.grade || getGrade(0),
    issues: (mod.issues || []).map(formatItem),
    warnings: (mod.warnings || []).map(formatItem),
    passed: (mod.passed || []).map(formatItem),
    data: sanitizeData(mod.data || {}),
  };
}

function formatItem(item) {
  return {
    label: item.label || "",
    message: item.msg || item.message || "",
    weight: item.weight || 0,
  };
}

// ─────────────────────────────────────────
// TECH STACK FORMATTER
// ─────────────────────────────────────────

function formatTechStack(techStack) {
  if (!techStack) return { count: 0, detected: [], grouped: {} };

  return {
    count: techStack.count || 0,
    detected: (techStack.detected || []).map((t) => ({
      name: t.name,
      category: t.category,
      icon: t.icon,
    })),
    grouped: techStack.grouped || {},
  };
}

// ─────────────────────────────────────────
// SANITIZE DATA (remove circular refs + cheerio)
// ─────────────────────────────────────────

function sanitizeData(data) {
  if (!data) return {};

  const clean = {};
  for (const [key, val] of Object.entries(data)) {
    // Cheerio objects skip karo
    if (key === "$" || key === "html") continue;

    // Functions skip karo
    if (typeof val === "function") continue;

    // Arrays — simple values rakho
    if (Array.isArray(val)) {
      clean[key] = val.slice(0, 50); // max 50 items
      continue;
    }

    // Nested objects — ek level deep
    if (val && typeof val === "object" && !Array.isArray(val)) {
      clean[key] = sanitizeData(val);
      continue;
    }

    clean[key] = val;
  }

  return clean;
}

// ─────────────────────────────────────────
// COMPACT FORMAT (for API lite responses)
// ─────────────────────────────────────────

/**
 * Lightweight response — sirf scores + top issues
 * Useful for dashboard cards, quick API checks
 */
function formatCompact(url, results, options = {}) {
  const full = formatResponse(url, results, options);

  // Sirf top 3 issues per module
  const compactModules = {};
  Object.entries(full.modules).forEach(([name, mod]) => {
    compactModules[name] = {
      percentage: mod.percentage,
      grade: mod.grade,
      topIssues: mod.issues.slice(0, 3),
      issueCount: mod.issues.length,
      warningCount: mod.warnings.length,
    };
  });

  return {
    success: true,
    requestId: full.requestId,
    meta: full.meta,
    summary: full.summary,
    modules: compactModules,
    techStack: {
      count: full.techStack.count,
      detected: full.techStack.detected.map((t) => t.name),
    },
  };
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function generateRequestId() {
  return "req_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}

function classifyError(error) {
  if (!error) return "UNKNOWN";
  const msg = error.message || "";
  const code = error.code || "";

  if (code === "ENOTFOUND" || msg.includes("nahi mila") || msg.includes("not found"))
    return "DNS_ERROR";
  if (code === "ETIMEDOUT" || code === "ECONNABORTED" || msg.includes("Timeout"))
    return "TIMEOUT_ERROR";
  if (code === "ECONNREFUSED") return "CONNECTION_ERROR";
  if (msg.includes("Invalid URL") || msg.includes("invalid"))
    return "INVALID_URL";
  return "FETCH_ERROR";
}

// ─────────────────────────────────────────
// VALIDATE URL (reusable)
// ─────────────────────────────────────────

function validateUrl(url) {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required", code: "MISSING_URL" };
  }

  url = url.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    new URL(url);
    return { valid: true, url };
  } catch {
    return { valid: false, error: `Invalid URL: ${url}`, code: "INVALID_URL" };
  }
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

module.exports = {
  formatResponse,
  formatError,
  formatCompact,
  buildSummary,
  formatModule,
  validateUrl,
  getGrade,
  GRADES,
  MODULES,
};
