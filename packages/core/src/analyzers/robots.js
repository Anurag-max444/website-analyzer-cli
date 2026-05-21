const { getGrade } = require('@website-analyzer/shared');
/**
 * Robots.txt Analyzer
 * Fetches and analyzes robots.txt
 * Checks: exists, valid format, sitemap reference, disallow rules,
 *         crawl-delay, user-agent coverage, dangerous blocks
 */

const axios = require("axios");
const { t } = require("../utils/lang");

// ─────────────────────────────────────────
// MAIN ANALYZER
// ─────────────────────────────────────────

async function analyzeRobots(baseUrl) {
  const results = {
    score: 0,
    maxScore: 0,
    issues: [],
    warnings: [],
    passed: [],
    data: {
      found: false,
      robotsUrl: null,
      content: null,
      rules: [],           // parsed user-agent rules
      sitemapRefs: [],     // sitemap URLs mentioned
      hasSitemapRef: false,
      hasGooglebot: false,
      hasAllAgents: false,
      crawlDelay: null,
      blockedPaths: [],
      blocksEverything: false,
      size: 0,
    },
  };

  const base = getBaseUrl(baseUrl);
  const robotsUrl = `${base}/robots.txt`;
  results.data.robotsUrl = robotsUrl;

  // ─────────────────────────────────────────
  // 1. ROBOTS.TXT FETCH KARO
  // ─────────────────────────────────────────
  let content = null;

  try {
    const res = await axios.get(robotsUrl, {
      timeout: 8000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WebsiteAnalyzerCLI/1.0)",
      },
      validateStatus: (s) => s < 500,
    });

    if (res.status === 200 && typeof res.data === "string" && res.data.trim().length > 0) {
      content = res.data;
    }
  } catch (e) {
    // fetch fail
  }

  // ─────────────────────────────────────────
  // 2. NOT FOUND
  // ─────────────────────────────────────────
  if (!content) {
    check(results, {
      label: "Robots.txt exists",
      weight: 20,
      pass: false,
      failMsg: t("robots.notFound"),
    });
    results.percentage = 0;
    results.grade = getGrade(0);
    return results;
  }

  results.data.found = true;
  results.data.content = content;
  results.data.size = content.length;

  check(results, {
    label: "Robots.txt exists",
    weight: 20,
    pass: true,
    failMsg: t("robots.notFound"),
    passMsg: t("robots.found")(robotsUrl),
  });

  // ─────────────────────────────────────────
  // 3. PARSE ROBOTS.TXT
  // ─────────────────────────────────────────
  const parsed = parseRobots(content);
  results.data.rules = parsed.rules;
  results.data.sitemapRefs = parsed.sitemaps;
  results.data.hasSitemapRef = parsed.sitemaps.length > 0;
  results.data.crawlDelay = parsed.crawlDelay;
  results.data.blockedPaths = parsed.blockedPaths;
  results.data.hasGooglebot = parsed.hasGooglebot;
  results.data.hasAllAgents = parsed.hasAllAgents;
  results.data.blocksEverything = parsed.blocksEverything;

  // ─────────────────────────────────────────
  // 4. SITEMAP REFERENCE
  // ─────────────────────────────────────────
  check(results, {
    label: "Sitemap reference in robots.txt",
    weight: 15,
    pass: results.data.hasSitemapRef,
    failMsg: t("robots.noSitemapRef"),
    passMsg: t("robots.hasSitemapRef")(parsed.sitemaps[0] || ""),
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 5. WILDCARD USER-AGENT (*)
  // ─────────────────────────────────────────
  check(results, {
    label: "Wildcard user-agent (*) defined",
    weight: 12,
    pass: results.data.hasAllAgents,
    failMsg: t("robots.noWildcard"),
    passMsg: t("robots.hasWildcard"),
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 6. BLOCKS EVERYTHING CHECK (Danger!)
  // ─────────────────────────────────────────
  check(results, {
    label: "Not blocking all crawlers",
    weight: 20,
    pass: !results.data.blocksEverything,
    failMsg: t("robots.blocksAll"),
    passMsg: t("robots.notBlockingAll"),
  });

  // ─────────────────────────────────────────
  // 7. GOOGLEBOT SPECIFIC RULES
  // ─────────────────────────────────────────
  check(results, {
    label: "Googlebot rules defined",
    weight: 8,
    pass: results.data.hasGooglebot || results.data.hasAllAgents,
    failMsg: t("robots.noGooglebot"),
    passMsg: t("robots.hasGooglebot"),
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 8. CRAWL DELAY CHECK
  // ─────────────────────────────────────────
  if (results.data.crawlDelay !== null) {
    const delay = results.data.crawlDelay;
    check(results, {
      label: "Crawl-delay reasonable",
      weight: 8,
      pass: delay <= 10,
      failMsg: t("robots.crawlDelayHigh")(delay),
      passMsg: t("robots.crawlDelayOk")(delay),
      isWarning: delay > 5 && delay <= 10,
    });
  }

  // ─────────────────────────────────────────
  // 9. SENSITIVE PATHS BLOCKED
  // ─────────────────────────────────────────
  const sensitivePaths = ["/admin", "/wp-admin", "/login", "/dashboard", "/.env", "/config"];
  const blockedSensitive = sensitivePaths.filter(p =>
    results.data.blockedPaths.some(b => b.startsWith(p) || p.startsWith(b))
  );

  check(results, {
    label: "Sensitive paths blocked",
    weight: 10,
    pass: blockedSensitive.length > 0,
    failMsg: t("robots.noSensitiveBlock"),
    passMsg: t("robots.hasSensitiveBlock")(blockedSensitive.join(", ")),
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 10. FILE SIZE CHECK
  // ─────────────────────────────────────────
  const sizeKB = Math.round(content.length / 1024);
  check(results, {
    label: "Robots.txt size OK",
    weight: 7,
    pass: content.length <= 500 * 1024, // 500KB limit
    failMsg: t("robots.tooLarge")(sizeKB),
    passMsg: t("robots.sizeOk")(sizeKB),
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // SCORE
  // ─────────────────────────────────────────
  const percentage =
    results.maxScore > 0
      ? Math.round((results.score / results.maxScore) * 100)
      : 0;

  results.percentage = percentage;
  results.grade = getGrade(percentage);

  return results;
}

// ─────────────────────────────────────────
// ROBOTS.TXT PARSER
// ─────────────────────────────────────────

function parseRobots(content) {
  const lines = content.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));

  const rules = [];
  const sitemaps = [];
  const blockedPaths = [];
  let crawlDelay = null;
  let hasGooglebot = false;
  let hasAllAgents = false;
  let blocksEverything = false;

  let currentAgent = null;

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.startsWith("user-agent:")) {
      currentAgent = line.split(":")[1]?.trim() || "";
      if (currentAgent === "*") hasAllAgents = true;
      if (currentAgent.toLowerCase() === "googlebot") hasGooglebot = true;

      rules.push({ agent: currentAgent, disallow: [], allow: [] });
    } else if (lower.startsWith("disallow:")) {
      const path = line.split(":")[1]?.trim() || "";
      if (path) {
        blockedPaths.push(path);
        const lastRule = rules[rules.length - 1];
        if (lastRule) lastRule.disallow.push(path);

        // Check karo — Disallow: / with User-agent: * = blocks everything
        if (path === "/" && currentAgent === "*") {
          blocksEverything = true;
        }
      }
    } else if (lower.startsWith("allow:")) {
      const path = line.split(":")[1]?.trim() || "";
      const lastRule = rules[rules.length - 1];
      if (lastRule && path) lastRule.allow.push(path);
    } else if (lower.startsWith("sitemap:")) {
      const sitemapUrl = line.split(/sitemap:/i)[1]?.trim() || "";
      if (sitemapUrl) sitemaps.push(sitemapUrl);
    } else if (lower.startsWith("crawl-delay:")) {
      const delay = parseFloat(line.split(":")[1]?.trim() || "0");
      if (!isNaN(delay)) crawlDelay = delay;
    }
  }

  return {
    rules,
    sitemaps,
    blockedPaths,
    crawlDelay,
    hasGooglebot,
    hasAllAgents,
    blocksEverything,
  };
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function getBaseUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url;
  }
}

function check(results, { label, weight, pass, failMsg, passMsg, isWarning }) {
  results.maxScore += weight;
  if (pass) {
    results.score += weight;
    results.passed.push({ label, msg: passMsg, weight });
  } else if (isWarning) {
    results.score += Math.floor(weight / 2);
    results.warnings.push({ label, msg: failMsg, weight });
  } else {
    results.issues.push({ label, msg: failMsg, weight });
  }
}



module.exports = { analyzeRobots };
