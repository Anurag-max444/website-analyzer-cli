const { getGrade } = require('@website-analyzer/shared');
/**
 * Sitemap Analyzer
 * Fetches and analyzes sitemap.xml / sitemap_index.xml
 * Checks: exists, valid XML, URL count, lastmod, changefreq, index sitemaps
 */

const axios = require("axios");
const { t } = require("../utils/lang");

// ─────────────────────────────────────────
// MAIN ANALYZER
// ─────────────────────────────────────────

async function analyzeSitemap(baseUrl) {
  const results = {
    score: 0,
    maxScore: 0,
    issues: [],
    warnings: [],
    passed: [],
    data: {
      found: false,
      sitemapUrl: null,
      type: null,           // "sitemap" | "index" | "none"
      urlCount: 0,
      sitemaps: [],         // index sitemap ke andar ke sitemaps
      hasLastmod: false,
      hasChangefreq: false,
      hasPriority: false,
      errors: [],
    },
  };

  const base = getBaseUrl(baseUrl);

  // ─────────────────────────────────────────
  // 1. ROBOTS.TXT SE SITEMAP DHUNDO
  // ─────────────────────────────────────────
  let sitemapUrls = await getSitemapUrlsFromRobots(base);

  // Common locations bhi add karo
  const commonLocations = [
    `${base}/sitemap.xml`,
    `${base}/sitemap_index.xml`,
    `${base}/sitemap-index.xml`,
    `${base}/sitemaps/sitemap.xml`,
    `${base}/wp-sitemap.xml`,          // WordPress
    `${base}/sitemap_index.xml`,
  ];

  // Deduplicate
  const allLocations = [...new Set([...sitemapUrls, ...commonLocations])];

  // ─────────────────────────────────────────
  // 2. SITEMAP FETCH KARO
  // ─────────────────────────────────────────
  let sitemapContent = null;
  let foundUrl = null;

  for (const url of allLocations) {
    try {
      const res = await axios.get(url, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; WebsiteAnalyzerCLI/1.0)" },
        validateStatus: (s) => s < 400,
      });

      if (res.status === 200 && res.data) {
        const content = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
        if (content.includes("<url>") || content.includes("<sitemap>") || content.includes("<?xml")) {
          sitemapContent = content;
          foundUrl = url;
          break;
        }
      }
    } catch (e) {
      // Try next
    }
  }

  // ─────────────────────────────────────────
  // 3. SITEMAP NAHI MILA
  // ─────────────────────────────────────────
  if (!sitemapContent) {
    check(results, {
      label: "Sitemap exists",
      weight: 20,
      pass: false,
      failMsg: t("sitemap.notFound"),
    });

    results.percentage = 0;
    results.grade = getGrade(0);
    return results;
  }

  results.data.found = true;
  results.data.sitemapUrl = foundUrl;

  // Sitemap found check
  check(results, {
    label: "Sitemap exists",
    weight: 20,
    pass: true,
    failMsg: t("sitemap.notFound"),
    passMsg: t("sitemap.found")(foundUrl),
  });

  // ─────────────────────────────────────────
  // 4. SITEMAP TYPE DETECT KARO
  // ─────────────────────────────────────────
  const isSitemapIndex = sitemapContent.includes("<sitemapindex");
  const isUrlSet = sitemapContent.includes("<urlset");
  results.data.type = isSitemapIndex ? "index" : isUrlSet ? "sitemap" : "unknown";

  // ─────────────────────────────────────────
  // 5. SITEMAP INDEX PARSE KARO
  // ─────────────────────────────────────────
  if (isSitemapIndex) {
    const sitemapLocs = extractTags(sitemapContent, "loc");
    results.data.sitemaps = sitemapLocs;

    check(results, {
      label: "Sitemap index valid",
      weight: 10,
      pass: sitemapLocs.length > 0,
      failMsg: t("sitemap.indexEmpty"),
      passMsg: t("sitemap.indexFound")(sitemapLocs.length),
    });

    // First child sitemap bhi parse karo for URLs
    if (sitemapLocs.length > 0) {
      try {
        const childRes = await axios.get(sitemapLocs[0], {
          timeout: 8000,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; WebsiteAnalyzerCLI/1.0)" },
          validateStatus: (s) => s < 400,
        });
        if (childRes.status === 200 && childRes.data) {
          const childContent = typeof childRes.data === "string" ? childRes.data : "";
          const childUrls = extractTags(childContent, "loc");
          results.data.urlCount = childUrls.length;

          // lastmod, changefreq, priority check
          results.data.hasLastmod = childContent.includes("<lastmod>");
          results.data.hasChangefreq = childContent.includes("<changefreq>");
          results.data.hasPriority = childContent.includes("<priority>");
        }
      } catch (e) {
        // Child fetch fail — ignore
      }
    }
  }

  // ─────────────────────────────────────────
  // 6. REGULAR SITEMAP PARSE KARO
  // ─────────────────────────────────────────
  if (isUrlSet) {
    const urls = extractTags(sitemapContent, "loc");
    results.data.urlCount = urls.length;
    results.data.hasLastmod = sitemapContent.includes("<lastmod>");
    results.data.hasChangefreq = sitemapContent.includes("<changefreq>");
    results.data.hasPriority = sitemapContent.includes("<priority>");

    // URL count check
    check(results, {
      label: "Sitemap has URLs",
      weight: 15,
      pass: urls.length > 0,
      failMsg: t("sitemap.noUrls"),
      passMsg: t("sitemap.urlCount")(urls.length),
    });

    check(results, {
      label: "Sitemap not too large",
      weight: 8,
      pass: urls.length <= 50000,
      failMsg: t("sitemap.tooLarge")(urls.length),
      passMsg: t("sitemap.sizeOk")(urls.length),
      isWarning: true,
    });
  }

  // ─────────────────────────────────────────
  // 7. LASTMOD CHECK
  // ─────────────────────────────────────────
  check(results, {
    label: "Sitemap has lastmod",
    weight: 8,
    pass: results.data.hasLastmod,
    failMsg: t("sitemap.noLastmod"),
    passMsg: t("sitemap.hasLastmod"),
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 8. VALID XML CHECK
  // ─────────────────────────────────────────
  const hasXmlDeclaration = sitemapContent.trimStart().startsWith("<?xml");
  check(results, {
    label: "Valid XML format",
    weight: 10,
    pass: hasXmlDeclaration || sitemapContent.includes("<urlset") || sitemapContent.includes("<sitemapindex"),
    failMsg: t("sitemap.invalidXml"),
    passMsg: t("sitemap.validXml"),
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 9. HTTPS URLS CHECK
  // ─────────────────────────────────────────
  const httpUrls = (sitemapContent.match(/<loc>http:\/\//g) || []).length;
  if (results.data.urlCount > 0) {
    check(results, {
      label: "Sitemap URLs are HTTPS",
      weight: 9,
      pass: httpUrls === 0,
      failMsg: t("sitemap.httpUrls")(httpUrls),
      passMsg: t("sitemap.httpsUrls"),
      isWarning: true,
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

async function getSitemapUrlsFromRobots(base) {
  try {
    const res = await axios.get(`${base}/robots.txt`, {
      timeout: 5000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WebsiteAnalyzerCLI/1.0)" },
      validateStatus: (s) => s < 400,
    });
    if (res.status === 200 && typeof res.data === "string") {
      const matches = res.data.match(/^Sitemap:\s*(.+)$/gim) || [];
      return matches.map((m) => m.replace(/^Sitemap:\s*/i, "").trim());
    }
  } catch (e) {
    // robots.txt nahi mila — ignore
  }
  return [];
}

function extractTags(xml, tag) {
  const regex = new RegExp(`<${tag}>([^<]+)<\/${tag}>`, "gi");
  const matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

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



module.exports = { analyzeSitemap };
