/**
 * Security Analyzer
 * Checks: HTTPS, Security Headers, CSP, HSTS, X-Frame-Options,
 *         CORS, Cookie Security, Mixed Content, Info Disclosure
 */

function analyzeSecurity(headers = {}, url = "", html = "") {
  const results = {
    score: 0,
    maxScore: 0,
    issues: [],
    warnings: [],
    passed: [],
    data: {},
  };

  const h = {};
  Object.keys(headers).forEach((k) => {
    h[k.toLowerCase()] = String(headers[k]);
  });

  // ─────────────────────────────────────────
  // 1. HTTPS
  // ─────────────────────────────────────────
  const isHttps = url.startsWith("https://");
  results.data.https = isHttps;

  check(results, {
    label: "HTTPS",
    weight: 15,
    pass: isHttps,
    failMsg: "Site HTTP use kar rahi hai — HTTPS enable karo urgently!",
    passMsg: "HTTPS enabled ✓",
  });

  // ─────────────────────────────────────────
  // 2. HSTS (HTTP Strict Transport Security)
  // ─────────────────────────────────────────
  const hsts = h["strict-transport-security"] || "";
  results.data.hsts = hsts;

  check(results, {
    label: "HSTS Header",
    weight: 12,
    pass: !!hsts,
    failMsg: "Strict-Transport-Security header missing — browsers ko HTTPS force nahi hoga",
    passMsg: `HSTS set: ${hsts.substring(0, 50)} ✓`,
    isWarning: true,
  });

  if (hsts) {
    const maxAge = parseInt((hsts.match(/max-age=(\d+)/) || [])[1] || "0");
    check(results, {
      label: "HSTS max-age",
      weight: 5,
      pass: maxAge >= 31536000,
      failMsg: `HSTS max-age ${maxAge}s — kam se kam 1 saal (31536000) hona chahiye`,
      passMsg: `HSTS max-age ${maxAge}s (>= 1 year) ✓`,
      isWarning: true,
    });
  }

  // ─────────────────────────────────────────
  // 3. CONTENT SECURITY POLICY (CSP)
  // ─────────────────────────────────────────
  const csp = h["content-security-policy"] || h["content-security-policy-report-only"] || "";
  results.data.csp = csp;

  check(results, {
    label: "Content-Security-Policy",
    weight: 12,
    pass: !!csp,
    failMsg: "CSP header missing — XSS attacks se protection nahi",
    passMsg: "CSP header set hai ✓",
    isWarning: true,
  });

  if (csp) {
    const hasUnsafeInline = csp.includes("'unsafe-inline'");
    const hasUnsafeEval = csp.includes("'unsafe-eval'");

    check(results, {
      label: "CSP unsafe-inline",
      weight: 6,
      pass: !hasUnsafeInline,
      failMsg: "CSP mein 'unsafe-inline' hai — XSS risk kam nahi hoga",
      passMsg: "CSP mein unsafe-inline nahi ✓",
      isWarning: true,
    });

    check(results, {
      label: "CSP unsafe-eval",
      weight: 5,
      pass: !hasUnsafeEval,
      failMsg: "CSP mein 'unsafe-eval' hai — JS injection risk",
      passMsg: "CSP mein unsafe-eval nahi ✓",
      isWarning: true,
    });
  }

  // ─────────────────────────────────────────
  // 4. X-FRAME-OPTIONS
  // ─────────────────────────────────────────
  const xframe = h["x-frame-options"] || "";
  results.data.xFrameOptions = xframe;

  check(results, {
    label: "X-Frame-Options",
    weight: 10,
    pass: !!xframe,
    failMsg: "X-Frame-Options missing — Clickjacking attack possible",
    passMsg: `X-Frame-Options: ${xframe} ✓`,
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 5. X-CONTENT-TYPE-OPTIONS
  // ─────────────────────────────────────────
  const xcto = h["x-content-type-options"] || "";
  results.data.xContentTypeOptions = xcto;

  check(results, {
    label: "X-Content-Type-Options",
    weight: 8,
    pass: xcto.toLowerCase() === "nosniff",
    failMsg: "X-Content-Type-Options: nosniff missing — MIME sniffing attack possible",
    passMsg: "X-Content-Type-Options: nosniff ✓",
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 6. REFERRER POLICY
  // ─────────────────────────────────────────
  const referrer = h["referrer-policy"] || "";
  results.data.referrerPolicy = referrer;

  const safeReferrers = [
    "no-referrer",
    "strict-origin",
    "strict-origin-when-cross-origin",
    "no-referrer-when-downgrade",
  ];

  check(results, {
    label: "Referrer-Policy",
    weight: 6,
    pass: safeReferrers.some((r) => referrer.toLowerCase().includes(r)),
    failMsg: referrer
      ? `Referrer-Policy "${referrer}" weak hai — strict-origin use karo`
      : "Referrer-Policy header missing",
    passMsg: `Referrer-Policy: ${referrer} ✓`,
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 7. PERMISSIONS POLICY
  // ─────────────────────────────────────────
  const perms = h["permissions-policy"] || h["feature-policy"] || "";
  results.data.permissionsPolicy = perms;

  check(results, {
    label: "Permissions-Policy",
    weight: 5,
    pass: !!perms,
    failMsg: "Permissions-Policy missing — camera/mic/location access unrestricted",
    passMsg: "Permissions-Policy set hai ✓",
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 8. SERVER INFO LEAKAGE
  // ─────────────────────────────────────────
  const server = h["server"] || "";
  const xPowered = h["x-powered-by"] || "";
  results.data.serverInfo = { server, xPoweredBy: xPowered };

  const serverLeaks = server && /apache\/[\d.]+|nginx\/[\d.]+|iis\/[\d.]+/i.test(server);
  const poweredLeaks = !!xPowered;

  check(results, {
    label: "Server info hidden",
    weight: 6,
    pass: !serverLeaks && !poweredLeaks,
    failMsg: [
      serverLeaks ? `Server version exposed: "${server}"` : "",
      poweredLeaks ? `X-Powered-By exposed: "${xPowered}" — hata do!` : "",
    ].filter(Boolean).join(" | "),
    passMsg: "Server info hidden hai ✓",
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 9. MIXED CONTENT (HTTP resources on HTTPS page)
  // ─────────────────────────────────────────
  if (isHttps && html) {
    const mixedContent = (html.match(/src=["']http:\/\//g) || []).length +
      (html.match(/href=["']http:\/\//g) || []).length;
    results.data.mixedContent = mixedContent;

    check(results, {
      label: "No mixed content",
      weight: 8,
      pass: mixedContent === 0,
      failMsg: `${mixedContent} HTTP resources found on HTTPS page — browser block kar dega`,
      passMsg: "Koi mixed content nahi ✓",
      isWarning: mixedContent <= 3,
    });
  }

  // ─────────────────────────────────────────
  // 10. CORS HEADER
  // ─────────────────────────────────────────
  const cors = h["access-control-allow-origin"] || "";
  results.data.cors = cors;

  if (cors) {
    check(results, {
      label: "CORS not wildcard",
      weight: 8,
      pass: cors !== "*",
      failMsg: "Access-Control-Allow-Origin: * — sab domains se requests allowed! Restrict karo",
      passMsg: `CORS restricted: ${cors} ✓`,
      isWarning: cors === "*",
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

module.exports = { analyzeSecurity };