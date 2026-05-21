const { getGrade } = require('@website-analyzer/shared');
/**
 * Security Analyzer — with t() translation support
 */

const { t } = require("../utils/lang");

function analyzeSecurity(headers = {}, url = "", html = "") {
  const results = { score: 0, maxScore: 0, issues: [], warnings: [], passed: [], data: {} };

  const h = {};
  Object.keys(headers).forEach((k) => { h[k.toLowerCase()] = String(headers[k]); });

  // 1. HTTPS
  const isHttps = url.startsWith("https://");
  results.data.https = isHttps;
  check(results, { label: "HTTPS", weight: 15, pass: isHttps, failMsg: t("security.noHttps"), passMsg: t("security.httpsOk") });

  // 2. HSTS
  const hsts = h["strict-transport-security"] || "";
  results.data.hsts = hsts;
  check(results, { label: "HSTS Header", weight: 12, pass: !!hsts, failMsg: t("security.hstsMissing"), passMsg: t("security.hstsOk")(hsts.substring(0, 50)), isWarning: true });

  if (hsts) {
    const maxAge = parseInt((hsts.match(/max-age=(\d+)/) || [])[1] || "0");
    check(results, { label: "HSTS max-age", weight: 5, pass: maxAge >= 31536000, failMsg: t("security.hstsMaxAge")(maxAge), passMsg: t("security.hstsMaxAgeOk")(maxAge), isWarning: true });
  }

  // 3. CSP
  const csp = h["content-security-policy"] || h["content-security-policy-report-only"] || "";
  results.data.csp = csp;
  check(results, { label: "CSP", weight: 12, pass: !!csp, failMsg: t("security.cspMissing"), passMsg: t("security.cspOk"), isWarning: true });

  if (csp) {
    check(results, { label: "CSP unsafe-inline", weight: 6, pass: !csp.includes("'unsafe-inline'"), failMsg: t("security.cspUnsafeInline"), passMsg: t("security.cspUnsafeInlineOk"), isWarning: true });
    check(results, { label: "CSP unsafe-eval", weight: 5, pass: !csp.includes("'unsafe-eval'"), failMsg: t("security.cspUnsafeEval"), passMsg: t("security.cspUnsafeEvalOk"), isWarning: true });
  }

  // 4. X-FRAME-OPTIONS
  const xframe = h["x-frame-options"] || "";
  results.data.xFrameOptions = xframe;
  check(results, { label: "X-Frame-Options", weight: 10, pass: !!xframe, failMsg: t("security.xframeMissing"), passMsg: t("security.xframeOk")(xframe), isWarning: true });

  // 5. X-CONTENT-TYPE-OPTIONS
  const xcto = h["x-content-type-options"] || "";
  results.data.xContentTypeOptions = xcto;
  check(results, { label: "X-Content-Type-Options", weight: 8, pass: xcto.toLowerCase() === "nosniff", failMsg: t("security.xctMissing"), passMsg: t("security.xctOk"), isWarning: true });

  // 6. REFERRER POLICY
  const referrer = h["referrer-policy"] || "";
  results.data.referrerPolicy = referrer;
  const safeReferrers = ["no-referrer", "strict-origin", "strict-origin-when-cross-origin", "no-referrer-when-downgrade"];
  const referrerSafe = safeReferrers.some((r) => referrer.toLowerCase().includes(r));
  check(results, { label: "Referrer-Policy", weight: 6, pass: referrerSafe, failMsg: referrer ? t("security.referrerWeak")(referrer) : t("security.referrerMissing"), passMsg: t("security.referrerOk")(referrer), isWarning: true });

  // 7. PERMISSIONS POLICY
  const perms = h["permissions-policy"] || h["feature-policy"] || "";
  results.data.permissionsPolicy = perms;
  check(results, { label: "Permissions-Policy", weight: 5, pass: !!perms, failMsg: t("security.permsMissing"), passMsg: t("security.permsOk"), isWarning: true });

  // 8. SERVER INFO LEAKAGE
  const server = h["server"] || "";
  const xPowered = h["x-powered-by"] || "";
  results.data.serverInfo = { server, xPoweredBy: xPowered };
  const serverLeaks = server && /apache\/[\d.]+|nginx\/[\d.]+|iis\/[\d.]+/i.test(server);
  const poweredLeaks = !!xPowered;
  check(results, { label: "Server info hidden", weight: 6, pass: !serverLeaks && !poweredLeaks, failMsg: t("security.serverLeaks")(serverLeaks ? server : "", poweredLeaks ? xPowered : ""), passMsg: t("security.serverHidden"), isWarning: true });

  // 9. MIXED CONTENT
  if (isHttps && html) {
    const mixedContent = (html.match(/src=["']http:\/\//g) || []).length + (html.match(/href=["']http:\/\//g) || []).length;
    results.data.mixedContent = mixedContent;
    check(results, { label: "No mixed content", weight: 8, pass: mixedContent === 0, failMsg: t("security.mixedContent")(mixedContent), passMsg: t("security.noMixedContent"), isWarning: mixedContent <= 3 });
  }

  // 10. CORS
  const cors = h["access-control-allow-origin"] || "";
  results.data.cors = cors;
  if (cors) {
    check(results, { label: "CORS not wildcard", weight: 8, pass: cors !== "*", failMsg: t("security.corsWildcard"), passMsg: t("security.corsOk")(cors), isWarning: cors === "*" });
  }

  const percentage = results.maxScore > 0 ? Math.round((results.score / results.maxScore) * 100) : 0;
  results.percentage = percentage;
  results.grade = getGrade(percentage);
  return results;
}

function check(results, { label, weight, pass, failMsg, passMsg, isWarning }) {
  results.maxScore += weight;
  if (pass) { results.score += weight; results.passed.push({ label, msg: passMsg, weight }); }
  else if (isWarning) { results.score += Math.floor(weight / 2); results.warnings.push({ label, msg: failMsg, weight }); }
  else { results.issues.push({ label, msg: failMsg, weight }); }
}



module.exports = { analyzeSecurity };
