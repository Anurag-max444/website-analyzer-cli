/**
 * Main Orchestrator — Sab analyzers ko combine karta hai
 * Fetches URL → Runs all analyzers → Returns complete results
 */

const chalk = require("chalk");
const ora = require("ora");

const { fetchUrl, isValidUrl, normalizeUrl } = require("./utils/fetcher");
const { analyzeSEO } = require("./analyzers/seo");
const { analyzeTechStack } = require("./analyzers/tech-stack");
const { analyzePerformance } = require("./analyzers/performance");
const { analyzeAccessibility } = require("./analyzers/accessibility");
const { analyzeLinks } = require("./analyzers/links");
const { printReport } = require("./utils/reporter");
const { exportJSON, exportHTML } = require("./utils/exporter");

// ─────────────────────────────────────────
// MAIN ANALYZE FUNCTION
// ─────────────────────────────────────────

async function analyze(rawUrl, options = {}) {
  const {
    only = null,        // Array: ['seo', 'performance'] — sirf yeh run karo
    json = false,       // Boolean: JSON output print karo
    export: exportPath = null,  // String: file export path
    exportFormat = "html",      // 'html' | 'json' | 'both'
    silent = false,     // Boolean: spinner/progress mat dikhao
    noLinks = false,    // Boolean: link checking skip karo (slow hota hai)
  } = options;

  // ─────────────────────────────────────────
  // 1. URL VALIDATE + NORMALIZE
  // ─────────────────────────────────────────
  if (!rawUrl) {
    throw new Error("URL provide karo! Example: website-analyzer https://google.com");
  }

  const url = normalizeUrl(rawUrl);

  if (!isValidUrl(url)) {
    throw new Error(`Invalid URL: "${url}" — sahi URL do, e.g. https://google.com`);
  }

  // ─────────────────────────────────────────
  // 2. FETCH URL
  // ─────────────────────────────────────────
  const fetchSpinner = silent ? null : ora({
    text: chalk.cyan(`Fetching ${url}...`),
    spinner: "dots",
  }).start();

  let fetchResult;
  try {
    fetchResult = await fetchUrl(url);
    if (fetchSpinner) fetchSpinner.succeed(chalk.green(`Fetched! (${fetchResult.responseTime}ms, HTTP ${fetchResult.statusCode})`));
  } catch (err) {
    if (fetchSpinner) fetchSpinner.fail(chalk.red("Fetch failed!"));
    throw err;
  }

  const { $, headers, responseTime } = fetchResult;

  // ─────────────────────────────────────────
  // 3. RUN ANALYZERS
  // ─────────────────────────────────────────
  const results = {
    seo: null,
    performance: null,
    techStack: null,
    accessibility: null,
    links: null,
  };

  const shouldRun = (name) => !only || only.includes(name);

  // SEO
  if (shouldRun("seo")) {
    const s = silent ? null : ora({ text: chalk.cyan("Analyzing SEO..."), spinner: "dots" }).start();
    try {
      results.seo = analyzeSEO($, url);
      if (s) s.succeed(chalk.green(`SEO analyzed — ${results.seo.percentage}% (${results.seo.grade.letter})`));
    } catch (err) {
      if (s) s.fail(chalk.red("SEO analysis failed"));
      results.seo = errorResult("SEO", err);
    }
  }

  // Tech Stack
  if (shouldRun("tech")) {
    const s = silent ? null : ora({ text: chalk.cyan("Detecting tech stack..."), spinner: "dots" }).start();
    try {
      results.techStack = analyzeTechStack($, headers);
      if (s) s.succeed(chalk.green(`Tech stack — ${results.techStack.count} technologies detected`));
    } catch (err) {
      if (s) s.fail(chalk.red("Tech stack detection failed"));
      results.techStack = { detected: [], grouped: {}, count: 0, summary: "Error" };
    }
  }

  // Performance
  if (shouldRun("performance")) {
    const s = silent ? null : ora({ text: chalk.cyan("Analyzing performance..."), spinner: "dots" }).start();
    try {
      results.performance = analyzePerformance($, fetchResult);
      if (s) s.succeed(chalk.green(`Performance — ${results.performance.percentage}% (${results.performance.grade.letter})`));
    } catch (err) {
      if (s) s.fail(chalk.red("Performance analysis failed"));
      results.performance = errorResult("Performance", err);
    }
  }

  // Accessibility
  if (shouldRun("accessibility")) {
    const s = silent ? null : ora({ text: chalk.cyan("Checking accessibility..."), spinner: "dots" }).start();
    try {
      results.accessibility = analyzeAccessibility($);
      if (s) s.succeed(chalk.green(`Accessibility — ${results.accessibility.percentage}% (${results.accessibility.grade.letter})`));
    } catch (err) {
      if (s) s.fail(chalk.red("Accessibility check failed"));
      results.accessibility = errorResult("Accessibility", err);
    }
  }

  // Links (optional — slow hota hai)
  if (shouldRun("links") && !noLinks) {
    const s = silent ? null : ora({ text: chalk.cyan("Checking links (may take a moment)..."), spinner: "dots" }).start();
    try {
      results.links = await analyzeLinks($, url, { maxLinks: 30, timeout: 8000, concurrency: 5 });
      if (s) s.succeed(chalk.green(`Links — ${results.links.data.total} found, ${results.links.data.broken.length} broken`));
    } catch (err) {
      if (s) s.fail(chalk.red("Link check failed"));
      results.links = errorResult("Links", err);
    }
  }

  // ─────────────────────────────────────────
  // 4. OUTPUT
  // ─────────────────────────────────────────

  if (json) {
    // JSON mode — terminal mein JSON print karo
    const output = buildJSONOutput(url, results, responseTime);
    console.log(JSON.stringify(output, null, 2));
  } else {
    // Normal mode — pretty terminal report
    printReport(url, results, responseTime);
  }

  // ─────────────────────────────────────────
  // 5. EXPORT
  // ─────────────────────────────────────────
  if (exportPath || exportFormat) {
    const expSpinner = silent ? null : ora({ text: chalk.cyan("Exporting report..."), spinner: "dots" }).start();
    try {
      const exported = [];

      if (exportFormat === "json" || exportFormat === "both") {
        const p = exportJSON(url, results, exportPath);
        exported.push(chalk.yellow("JSON: ") + chalk.white(p));
      }

      if (exportFormat === "html" || exportFormat === "both" || (!exportFormat && exportPath)) {
        const p = exportHTML(url, results, exportPath);
        exported.push(chalk.yellow("HTML: ") + chalk.white(p));
      }

      if (expSpinner) {
        expSpinner.succeed(chalk.green("Report exported!"));
        exported.forEach((e) => console.log("  📄 " + e));
      }
    } catch (err) {
      if (expSpinner) expSpinner.fail(chalk.red("Export failed: " + err.message));
    }
  }

  return results;
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function buildJSONOutput(url, results, responseTime) {
  const cats = ["seo", "performance", "accessibility", "links"];
  let totalScore = 0, totalMax = 0;
  cats.forEach((c) => {
    if (results[c]) {
      totalScore += results[c].score || 0;
      totalMax += results[c].maxScore || 0;
    }
  });
  const overallPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  return {
    url,
    analyzedAt: new Date().toISOString(),
    responseTime,
    overall: {
      score: totalScore,
      maxScore: totalMax,
      percentage: overallPct,
      grade: getGrade(overallPct),
    },
    seo: results.seo ? { percentage: results.seo.percentage, grade: results.seo.grade, issues: results.seo.issues, warnings: results.seo.warnings } : null,
    performance: results.performance ? { percentage: results.performance.percentage, grade: results.performance.grade, issues: results.performance.issues, warnings: results.performance.warnings, data: results.performance.data } : null,
    accessibility: results.accessibility ? { percentage: results.accessibility.percentage, grade: results.accessibility.grade, issues: results.accessibility.issues, warnings: results.accessibility.warnings } : null,
    links: results.links ? { percentage: results.links.percentage, grade: results.links.grade, total: results.links.data.total, broken: results.links.data.broken.length } : null,
    techStack: results.techStack ? { count: results.techStack.count, detected: results.techStack.detected } : null,
  };
}

function errorResult(name, err) {
  return {
    score: 0, maxScore: 0, percentage: 0,
    grade: { letter: "F", emoji: "💀", label: "Error" },
    issues: [{ msg: `${name} analysis error: ${err.message}` }],
    warnings: [], passed: [], data: {},
  };
}

function getGrade(percentage) {
  if (percentage >= 90) return { letter: "A", emoji: "🟢", label: "Excellent" };
  if (percentage >= 75) return { letter: "B", emoji: "🟡", label: "Good" };
  if (percentage >= 60) return { letter: "C", emoji: "🟠", label: "Average" };
  if (percentage >= 40) return { letter: "D", emoji: "🔴", label: "Poor" };
  return { letter: "F", emoji: "💀", label: "Very Poor" };
}

module.exports = { analyze };
