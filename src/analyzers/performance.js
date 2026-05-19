/**
 * Performance Analyzer
 * Checks: Response time, Page size, Resource counts,
 *         HTTP headers, Compression, Caching, HTTPS
 */

function analyzePerformance($, responseData) {
  const { responseTime, contentLength, headers = {}, statusCode, url } = responseData;

  const results = {
    score: 0,
    maxScore: 0,
    issues: [],
    warnings: [],
    passed: [],
    data: {},
  };

  const lowerHeaders = {};
  Object.keys(headers).forEach((k) => {
    lowerHeaders[k.toLowerCase()] = headers[k];
  });

  // ─────────────────────────────────────────
  // 1. HTTPS CHECK
  // ─────────────────────────────────────────
  const isHttps = url.startsWith("https://");
  results.data.https = isHttps;

  check(results, {
    label: "HTTPS enabled",
    weight: 15,
    pass: isHttps,
    failMsg: "Site HTTP use kar raha hai — HTTPS nahi! Security risk + SEO penalty",
    passMsg: "HTTPS enabled hai ✓",
  });

  // ─────────────────────────────────────────
  // 2. RESPONSE TIME
  // ─────────────────────────────────────────
  results.data.responseTime = responseTime;

  const rtPass = responseTime < 1000;
  const rtWarn = responseTime < 2500;

  check(results, {
    label: "Response time",
    weight: 15,
    pass: rtPass,
    failMsg: rtWarn
      ? `Response time ${responseTime}ms — thoda slow (ideal: <1000ms)`
      : `Response time ${responseTime}ms — bahut slow! (ideal: <1000ms)`,
    passMsg: `Response time ${responseTime}ms — fast! ✓`,
    isWarning: !rtPass && rtWarn,
  });

  // ─────────────────────────────────────────
  // 3. PAGE SIZE
  // ─────────────────────────────────────────
  const pageSizeKB = Math.round(contentLength / 1024);
  results.data.pageSizeKB = pageSizeKB;

  check(results, {
    label: "Page size",
    weight: 10,
    pass: pageSizeKB < 500,
    failMsg:
      pageSizeKB < 1000
        ? `Page size ${pageSizeKB}KB — thoda bada (ideal: <500KB)`
        : `Page size ${pageSizeKB}KB — bahut bada! Users slow experience karenge`,
    passMsg: `Page size ${pageSizeKB}KB — sahi hai ✓`,
    isWarning: pageSizeKB >= 500 && pageSizeKB < 1000,
  });

  // ─────────────────────────────────────────
  // 4. GZIP / COMPRESSION
  // ─────────────────────────────────────────
  const encoding = lowerHeaders["content-encoding"] || "";
  const isCompressed = /gzip|br|deflate|zstd/.test(encoding);
  results.data.compression = encoding || "none";

  check(results, {
    label: "Compression (gzip/brotli)",
    weight: 10,
    pass: isCompressed,
    failMsg: "Content compression nahi — gzip/brotli enable karo, bandwidth bachega",
    passMsg: `Compression: ${encoding} ✓`,
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 5. CACHING HEADERS
  // ─────────────────────────────────────────
  const cacheControl = lowerHeaders["cache-control"] || "";
  const etag = lowerHeaders["etag"] || "";
  const lastModified = lowerHeaders["last-modified"] || "";
  const hasCaching = !!(cacheControl || etag || lastModified);
  results.data.caching = { cacheControl, etag: !!etag, lastModified: !!lastModified };

  check(results, {
    label: "Caching headers",
    weight: 8,
    pass: hasCaching,
    failMsg: "Cache headers missing — browser har baar fresh request karega",
    passMsg: `Caching set hai (${cacheControl || "etag/last-modified"}) ✓`,
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 6. RESOURCE COUNT
  // ─────────────────────────────────────────
  const scripts = $("script[src]").length;
  const stylesheets = $('link[rel="stylesheet"]').length;
  const images = $("img").length;
  const totalResources = scripts + stylesheets + images;

  results.data.resources = { scripts, stylesheets, images, total: totalResources };

  check(results, {
    label: "Script count",
    weight: 7,
    pass: scripts <= 10,
    failMsg: `${scripts} external scripts — bahut zyada! (ideal: ≤10) Page slow hoga`,
    passMsg: `Script count: ${scripts} ✓`,
    isWarning: scripts > 10 && scripts <= 20,
  });

  check(results, {
    label: "Stylesheet count",
    weight: 5,
    pass: stylesheets <= 5,
    failMsg: `${stylesheets} stylesheets — zyada hain (ideal: ≤5)`,
    passMsg: `Stylesheet count: ${stylesheets} ✓`,
    isWarning: stylesheets > 5 && stylesheets <= 10,
  });

  // ─────────────────────────────────────────
  // 7. RENDER BLOCKING RESOURCES
  // ─────────────────────────────────────────
  let renderBlocking = 0;
  $("script[src]").each((i, el) => {
    const s = $(el);
    if (!s.attr("async") && !s.attr("defer")) renderBlocking++;
  });
  results.data.renderBlockingScripts = renderBlocking;

  check(results, {
    label: "No render-blocking scripts",
    weight: 8,
    pass: renderBlocking === 0,
    failMsg: `${renderBlocking} render-blocking scripts — async/defer add karo`,
    passMsg: "Koi render-blocking script nahi ✓",
    isWarning: renderBlocking > 0 && renderBlocking <= 3,
  });

  // ─────────────────────────────────────────
  // 8. IMAGE OPTIMIZATION HINTS
  // ─────────────────────────────────────────
  let unoptimizedImages = 0;
  $("img").each((i, el) => {
    const src = $(el).attr("src") || "";
    // Check karo ki modern formats use ho rahe hain
    if (src && !/\.webp$|\.avif$|\.svg$/i.test(src) && /\.(jpg|jpeg|png|gif)$/i.test(src)) {
      unoptimizedImages++;
    }
  });
  results.data.unoptimizedImages = unoptimizedImages;

  if (images > 0) {
    check(results, {
      label: "Modern image formats (WebP/AVIF)",
      weight: 6,
      pass: unoptimizedImages === 0,
      failMsg: `${unoptimizedImages} images old format mein (JPG/PNG) — WebP use karo`,
      passMsg: "Images modern format mein hain ✓",
      isWarning: true,
    });
  }

  // ─────────────────────────────────────────
  // 9. INLINE STYLES / SCRIPTS (MINOR)
  // ─────────────────────────────────────────
  const inlineScripts = $("script:not([src])").length;
  const inlineStyles = $("style").length;
  results.data.inline = { scripts: inlineScripts, styles: inlineStyles };

  // ─────────────────────────────────────────
  // 10. HTTP STATUS
  // ─────────────────────────────────────────
  results.data.statusCode = statusCode;

  check(results, {
    label: "HTTP status OK",
    weight: 10,
    pass: statusCode >= 200 && statusCode < 300,
    failMsg: `HTTP ${statusCode} — site properly accessible nahi!`,
    passMsg: `HTTP ${statusCode} OK ✓`,
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
// HELPERS
// ─────────────────────────────────────────

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

function getGrade(percentage) {
  if (percentage >= 90) return { letter: "A", emoji: "🟢", label: "Excellent" };
  if (percentage >= 75) return { letter: "B", emoji: "🟡", label: "Good" };
  if (percentage >= 60) return { letter: "C", emoji: "🟠", label: "Average" };
  if (percentage >= 40) return { letter: "D", emoji: "🔴", label: "Poor" };
  return { letter: "F", emoji: "💀", label: "Very Poor" };
}

module.exports = { analyzePerformance };
