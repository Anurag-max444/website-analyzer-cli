const { getGrade } = require('@website-analyzer/shared');
/**
 * Links Analyzer
 * Checks: Broken links, Internal vs External links,
 *         Redirect chains, Nofollow links, mailto/tel links
 */

const { t } = require("../utils/lang");

const axios = require("axios");

// ─────────────────────────────────────────
// MAIN ANALYZER
// ─────────────────────────────────────────

async function analyzeLinks($, baseUrl, options = {}) {
  const { maxLinks = 30, timeout = 8000, concurrency = 5 } = options;

  const results = {
    score: 0,
    maxScore: 0,
    issues: [],
    warnings: [],
    passed: [],
    data: {
      total: 0,
      internal: [],
      external: [],
      broken: [],
      redirects: [],
      nofollow: [],
      mailto: [],
      tel: [],
      skipped: 0,
    },
  };

  // ─────────────────────────────────────────
  // 1. LINKS COLLECT KARO
  // ─────────────────────────────────────────
  const allLinks = [];
  const seen = new Set();

  $("a[href]").each((i, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim().substring(0, 60);
    const rel = $(el).attr("rel") || "";
    const isNofollow = rel.includes("nofollow");

    // Special links alag handle karo
    if (href.startsWith("mailto:")) {
      results.data.mailto.push({ href, text });
      return;
    }
    if (href.startsWith("tel:")) {
      results.data.tel.push({ href, text });
      return;
    }
    if (href.startsWith("#") || href.startsWith("javascript:") || !href) {
      return;
    }

    // Absolute URL banao
    let absoluteUrl = "";
    try {
      if (href.startsWith("http://") || href.startsWith("https://")) {
        absoluteUrl = href;
      } else if (href.startsWith("//")) {
        absoluteUrl = "https:" + href;
      } else if (href.startsWith("/")) {
        const base = new URL(baseUrl);
        absoluteUrl = base.origin + href;
      } else {
        absoluteUrl = new URL(href, baseUrl).href;
      }

      // Query string aur fragment hata do for deduplication
      const cleanUrl = absoluteUrl.split("?")[0].split("#")[0];
      if (seen.has(cleanUrl)) return;
      seen.add(cleanUrl);

      const isInternal = isSameDomain(absoluteUrl, baseUrl);

      allLinks.push({
        url: absoluteUrl,
        text,
        isInternal,
        isNofollow,
        status: null,
        isRedirect: false,
        isBroken: false,
      });

      if (isNofollow) results.data.nofollow.push({ url: absoluteUrl, text });
    } catch (e) {
      // Invalid URL skip karo
    }
  });

  // Internal / External split
  results.data.internal = allLinks.filter((l) => l.isInternal);
  results.data.external = allLinks.filter((l) => !l.isInternal);
  results.data.total = allLinks.length;

  // ─────────────────────────────────────────
  // 2. LINKS CHECK KARO (limited set)
  // ─────────────────────────────────────────
  const linksToCheck = allLinks.slice(0, maxLinks);
  const skipped = allLinks.length - linksToCheck.length;
  results.data.skipped = skipped;

  // Concurrent batches mein check karo
  const checked = await checkLinksInBatches(linksToCheck, concurrency, timeout);

  // Results process karo
  checked.forEach((link) => {
    if (link.isBroken) results.data.broken.push(link);
    if (link.isRedirect) results.data.redirects.push(link);
  });

  // ─────────────────────────────────────────
  // 3. SCORING
  // ─────────────────────────────────────────
  const totalChecked = checked.length;
  const brokenCount = results.data.broken.length;
  const redirectCount = results.data.redirects.length;

  // Broken links
  check(results, {
    label: "No broken links",
    weight: 25,
    pass: brokenCount === 0,
    failMsg: t("links.brokenFound")(brokenCount),
    passMsg: totalChecked > 0 ? t("links.nobroken") + ` (${totalChecked} links checked)` : "No checkable links found",
    isWarning: brokenCount > 0 && brokenCount <= 3,
  });

  // Redirect chains
  check(results, {
    label: "Minimal redirects",
    weight: 10,
    pass: redirectCount <= 2,
    failMsg: t("links.redirectsFound")(redirectCount),
    passMsg: redirectCount === 0 ? t("links.noRedirects") : `${redirectCount} redirects (acceptable) ✓`,
    isWarning: redirectCount > 2 && redirectCount <= 5,
  });

  // Internal links present
  check(results, {
    label: "Internal links present",
    weight: 8,
    pass: results.data.internal.length >= 3,
    failMsg: results.data.internal.length === 0 ? t("links.noInternal") : `Only ${results.data.internal.length} internal links — add more`,
    passMsg: t("links.internalOk")(results.data.internal.length),
    isWarning: results.data.internal.length > 0 && results.data.internal.length < 3,
  });

  // External links present
  check(results, {
    label: "External links present",
    weight: 5,
    pass: results.data.external.length >= 1,
    failMsg: t("links.noExternal"),
    passMsg: t("links.externalOk")(results.data.external.length),
    isWarning: true,
  });

  // Nofollow check
  if (results.data.nofollow.length > 0) {
    check(results, {
      label: "Nofollow links",
      weight: 3,
      pass: true,
      failMsg: "",
      passMsg: t("links.nofollowOk")(results.data.nofollow.length),
    });
  }

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
// HELPERS
// ─────────────────────────────────────────

async function checkLinksInBatches(links, concurrency, timeout) {
  const results = [];

  for (let i = 0; i < links.length; i += concurrency) {
    const batch = links.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((link) => checkSingleLink(link, timeout))
    );
    results.push(...batchResults);
  }

  return results;
}

async function checkSingleLink(link, timeout) {
  try {
    const response = await axios.head(link.url, {
      timeout,
      maxRedirects: 0, // Manually track redirects
      validateStatus: () => true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; WebsiteAnalyzerCLI/1.0)",
      },
    });

    const status = response.status;
    const isBroken = status >= 400;
    const isRedirect = status >= 300 && status < 400;

    return {
      ...link,
      status,
      isBroken,
      isRedirect,
      redirectUrl: isRedirect ? response.headers.location : null,
    };
  } catch (error) {
    // HEAD support nahi to GET try karo
    if (error.code === "ERR_FR_TOO_MANY_REDIRECTS" || error.response) {
      return { ...link, status: error.response?.status || 0, isBroken: true };
    }

    // Network error = broken
    if (
      error.code === "ENOTFOUND" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ETIMEDOUT" ||
      error.code === "ECONNABORTED"
    ) {
      return { ...link, status: 0, isBroken: true, error: error.code };
    }

    // x-deny-reason = sandbox mein blocked, skip karo (not broken)
    if (error.response?.headers?.["x-deny-reason"]) {
      return { ...link, status: 200, isBroken: false, skippedByProxy: true };
    }

    return { ...link, status: 0, isBroken: false, skippedByProxy: true };
  }
}

function isSameDomain(url, baseUrl) {
  try {
    const urlHost = new URL(url).hostname.replace(/^www\./, "");
    const baseHost = new URL(baseUrl).hostname.replace(/^www\./, "");
    return urlHost === baseHost;
  } catch {
    return false;
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



module.exports = { analyzeLinks };
