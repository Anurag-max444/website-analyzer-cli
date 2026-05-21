/**
 * POST /api/v1/analyze
 * Real core engine integration
 */

import { ok, err, tooManyRequests } from "../lib/response.js";
import { validateUrl } from "../lib/validate.js";
import { saveAnonymousScan } from "../lib/db.js";
import { MODULES } from "../lib/constants.js";

let coreEngine = null;

function getCore() {
  if (!coreEngine) {
    try {
      coreEngine = require("../../dist/core.bundle.js");
    } catch (e) {
      throw new Error("Core engine not bundled. Run: npm run build:core");
    }
  }
  return coreEngine;
}

export async function handleAnalyze(request, env, ctx) {
  const startTime = Date.now();

  // 1. Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", 400, "INVALID_BODY");
  }

  const { url: rawUrl, modules: requestedModules, lang = "en", noLinks = true, compact = false } = body;

  // 2. Validate URL
  const urlCheck = validateUrl(rawUrl);
  if (!urlCheck.valid) return err(urlCheck.error, 400, urlCheck.code);
  const url = urlCheck.url;

  // 3. Modules validate
  let only = null;
  if (requestedModules && Array.isArray(requestedModules)) {
    const invalid = requestedModules.filter((m) => !MODULES.includes(m));
    if (invalid.length > 0) {
      return err(`Invalid modules: ${invalid.join(", ")}. Valid: ${MODULES.join(", ")}`, 400, "INVALID_MODULES");
    }
    only = requestedModules;
  }

  // 4. Rate limit
  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
  if (env.DB) {
    const limited = await isRateLimited(env.DB, clientIp);
    if (limited) return tooManyRequests("Too many scans. Wait before trying again.");
  }

  // 5. Run analysis
  try {
    const { analyze, setLang } = getCore();
    if (setLang) setLang(lang);

    const results = await analyze(url, {
      only,
      noLinks,
      silent: true,
      json: false,
      export: null,
    });

    const responseTime = Date.now() - startTime;
    const formatted = buildResponse(url, results, responseTime, lang, compact);

    // 6. Save to D1 background
    if (env.DB) {
      ctx.waitUntil(saveAnonymousScan(env.DB, { url, result: formatted, clientIp }));
    }

    return ok(formatted);

  } catch (error) {
    console.error("Analysis error:", error.message);
    return err(`Analysis failed: ${error.message}`, 500, "ANALYSIS_FAILED");
  }
}

async function isRateLimited(db, clientIp) {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const result = await db
      .prepare("SELECT COUNT(*) as count FROM scans WHERE created_at > ?")
      .bind(oneHourAgo).first();
    return (result?.count || 0) >= 20;
  } catch { return false; }
}

function buildResponse(url, results, responseTime, lang, compact) {
  const moduleNames = ["seo","performance","security","accessibility","links","sitemap","robots","schema"];
  const modules = {};
  let totalScore = 0, totalMax = 0, totalIssues = 0, totalWarnings = 0;

  moduleNames.forEach((name) => {
    const m = results[name];
    if (!m) return;
    totalScore += m.score || 0;
    totalMax += m.maxScore || 0;
    totalIssues += (m.issues || []).length;
    totalWarnings += (m.warnings || []).length;

    modules[name] = compact
      ? { percentage: m.percentage, grade: m.grade, issueCount: (m.issues||[]).length, topIssues: (m.issues||[]).slice(0,3) }
      : { score: m.score, maxScore: m.maxScore, percentage: m.percentage, grade: m.grade, issues: m.issues||[], warnings: m.warnings||[], passed: m.passed||[], data: m.data||{} };
  });

  const pct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  const grades = [{min:90,l:"A",e:"🟢",lb:"Excellent"},{min:75,l:"B",e:"🟡",lb:"Good"},{min:60,l:"C",e:"🟠",lb:"Average"},{min:40,l:"D",e:"🔴",lb:"Poor"},{min:0,l:"F",e:"💀",lb:"Very Poor"}];
  const grade = grades.find(g => pct >= g.min);

  return {
    success: true,
    requestId: "req_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,6),
    meta: { url, scannedAt: new Date().toISOString(), responseTime, lang, version: "v1" },
    summary: {
      overall: { score: totalScore, maxScore: totalMax, percentage: pct, grade: { letter: grade.l, emoji: grade.e, label: grade.lb } },
      totalIssues, totalWarnings,
      totalPassed: moduleNames.reduce((a, n) => a + ((results[n]?.passed||[]).length), 0),
      modulesScanned: Object.keys(modules).length,
    },
    modules,
    techStack: results.techStack || { count: 0, detected: [] },
  };
}
