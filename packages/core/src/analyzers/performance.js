const { getGrade } = require('@website-analyzer/shared');
/**
 * Performance Analyzer
 * Checks: Response time, Page size, Resource counts,
 *         HTTP headers, Compression, Caching, HTTPS
 */

const { t } = require("../utils/lang");

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

  // 1. HTTPS
  const isHttps = url.startsWith("https://");
  results.data.https = isHttps;

  check(results, {
    label: "HTTPS enabled",
    weight: 15,
    pass: isHttps,
    failMsg: t("performance.noHttps"),
    passMsg: t("performance.httpsOk"),
  });

  // 2. RESPONSE TIME
  results.data.responseTime = responseTime;

  const rtPass = responseTime < 1000;
  const rtWarn = responseTime < 2500;

  check(results, {
    label: "Response time",
    weight: 15,
    pass: rtPass,
    failMsg: !rtPass && rtWarn ? t("performance.responseWarn")(responseTime) : t("performance.responseSlow")(responseTime),
    passMsg: t("performance.responseFast")(responseTime),
    isWarning: !rtPass && rtWarn,
  });

  // 3. PAGE SIZE
  const pageSizeKB = Math.round(contentLength / 1024);
  results.data.pageSizeKB = pageSizeKB;

  check(results, {
    label: "Page size",
    weight: 10,
    pass: pageSizeKB < 500,
    failMsg: pageSizeKB < 1000 ? t("performance.pageWarn")(pageSizeKB) : t("performance.pageLarge")(pageSizeKB),
    passMsg: t("performance.pageOk")(pageSizeKB),
    isWarning: pageSizeKB >= 500 && pageSizeKB < 1000,
  });

  // 4. COMPRESSION
  const encoding = lowerHeaders["content-encoding"] || "";
  const isCompressed = /gzip|br|deflate|zstd/.test(encoding);
  results.data.compression = encoding || "none";

  check(results, {
    label: "Compression (gzip/brotli)",
    weight: 10,
    pass: isCompressed,
    failMsg: t("performance.noCompression"),
    passMsg: t("performance.compressionOk")(encoding),
    isWarning: true,
  });

  // 5. CACHING
  const cacheControl = lowerHeaders["cache-control"] || "";
  const etag = lowerHeaders["etag"] || "";
  const lastModified = lowerHeaders["last-modified"] || "";
  const hasCaching = !!(cacheControl || etag || lastModified);
  results.data.caching = { cacheControl, etag: !!etag, lastModified: !!lastModified };

  check(results, {
    label: "Caching headers",
    weight: 8,
    pass: hasCaching,
    failMsg: t("performance.noCache"),
    passMsg: t("performance.cacheOk")(cacheControl),
    isWarning: true,
  });

  // 6. RESOURCE COUNT
  const scripts = $("script[src]").length;
  const stylesheets = $('link[rel="stylesheet"]').length;
  const images = $("img").length;
  const totalResources = scripts + stylesheets + images;

  results.data.resources = { scripts, stylesheets, images, total: totalResources };

  check(results, {
    label: "Script count",
    weight: 7,
    pass: scripts <= 10,
    failMsg: t("performance.tooManyScripts")(scripts),
    passMsg: t("performance.scriptsOk")(scripts),
    isWarning: scripts > 10 && scripts <= 20,
  });

  check(results, {
    label: "Stylesheet count",
    weight: 5,
    pass: stylesheets <= 5,
    failMsg: t("performance.tooManyStyles")(stylesheets),
    passMsg: t("performance.stylesOk")(stylesheets),
    isWarning: stylesheets > 5 && stylesheets <= 10,
  });

  // 7. RENDER BLOCKING
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
    failMsg: t("performance.renderBlocking")(renderBlocking),
    passMsg: t("performance.noRenderBlocking"),
    isWarning: renderBlocking > 0 && renderBlocking <= 3,
  });

  // 8. IMAGE OPTIMIZATION
  let unoptimizedImages = 0;
  $("img").each((i, el) => {
    const src = $(el).attr("src") || "";
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
      failMsg: t("performance.oldImageFormats")(unoptimizedImages),
      passMsg: t("performance.modernImages"),
      isWarning: true,
    });
  }

  // 9. INLINE
  const inlineScripts = $("script:not([src])").length;
  const inlineStyles = $("style").length;
  results.data.inline = { scripts: inlineScripts, styles: inlineStyles };

  // 10. HTTP STATUS
  results.data.statusCode = statusCode;

  check(results, {
    label: "HTTP status OK",
    weight: 10,
    pass: statusCode >= 200 && statusCode < 300,
    failMsg: t("performance.badStatus")(statusCode),
    passMsg: t("performance.statusOk")(statusCode),
  });

  const percentage =
    results.maxScore > 0
      ? Math.round((results.score / results.maxScore) * 100)
      : 0;

  results.percentage = percentage;
  results.grade = getGrade(percentage);

  return results;
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



module.exports = { analyzePerformance };
