/**
 * Exporter — Analysis results ko JSON ya HTML file mein save karta hai
 */

const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────
// JSON EXPORT
// ─────────────────────────────────────────

function exportJSON(url, results, outputPath) {
  const report = {
    meta: {
      url,
      analyzedAt: new Date().toISOString(),
      tool: "website-analyzer-cli",
      version: "1.0.0",
    },
    summary: buildSummary(results),
    seo: sanitize(results.seo),
    performance: sanitize(results.performance),
    accessibility: sanitize(results.accessibility),
    links: sanitize(results.links),
    techStack: results.techStack,
    security: sanitize(results.security),
    sitemap: sanitize(results.sitemap),
    robots: sanitize(results.robots),
    schema: sanitize(results.schema),
  };

  const filePath = resolveOutputPath(outputPath, "json");
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), "utf-8");
  return filePath;
}

// ─────────────────────────────────────────
// HTML EXPORT
// ─────────────────────────────────────────

function exportHTML(url, results, outputPath) {
  const summary = buildSummary(results);
  const html = buildHTMLReport(url, results, summary);
  const filePath = resolveOutputPath(outputPath, "html");
  fs.writeFileSync(filePath, html, "utf-8");
  return filePath;
}

// ─────────────────────────────────────────
// HTML BUILDER
// ─────────────────────────────────────────

function buildHTMLReport(url, results, summary) {
  const { seo, performance, accessibility, links, techStack, security, sitemap, robots, schema } = results;
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Website Analysis Report — ${escHtml(url)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f1117; color: #e2e8f0; line-height: 1.6; }
    .container { max-width: 960px; margin: 0 auto; padding: 32px 16px; }

    /* Header */
    .header { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #334155; border-radius: 16px; padding: 32px; margin-bottom: 28px; }
    .header h1 { font-size: 1.6rem; color: #38bdf8; margin-bottom: 8px; }
    .header .url { color: #94a3b8; font-size: 0.95rem; word-break: break-all; }
    .header .meta { display: flex; gap: 24px; margin-top: 16px; flex-wrap: wrap; }
    .header .meta span { color: #64748b; font-size: 0.85rem; }
    .header .meta strong { color: #cbd5e1; }

    /* Score Cards */
    .scores-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .score-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center; transition: transform 0.2s; }
    .score-card:hover { transform: translateY(-2px); }
    .score-card .label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .score-card .score { font-size: 2rem; font-weight: 700; margin-bottom: 4px; }
    .score-card .grade { font-size: 1.1rem; font-weight: 600; }
    .score-card .bar-wrap { background: #0f172a; border-radius: 99px; height: 6px; margin-top: 10px; overflow: hidden; }
    .score-card .bar-fill { height: 100%; border-radius: 99px; transition: width 0.8s ease; }
    .grade-a .score, .grade-a .grade { color: #22c55e; }
    .grade-a .bar-fill { background: #22c55e; }
    .grade-b .score, .grade-b .grade { color: #38bdf8; }
    .grade-b .bar-fill { background: #38bdf8; }
    .grade-c .score, .grade-c .grade { color: #f59e0b; }
    .grade-c .bar-fill { background: #f59e0b; }
    .grade-d .score, .grade-d .grade { color: #ef4444; }
    .grade-d .bar-fill { background: #ef4444; }
    .grade-f .score, .grade-f .grade { color: #dc2626; }
    .grade-f .bar-fill { background: #dc2626; }

    /* Overall card */
    .overall-card { background: linear-gradient(135deg, #1e3a5f, #1e293b); border: 1px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center; }
    .overall-card .label { font-size: 0.8rem; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .overall-card .score { font-size: 2.4rem; font-weight: 800; color: #60a5fa; margin-bottom: 4px; }
    .overall-card .grade { font-size: 1.2rem; font-weight: 600; color: #93c5fd; }
    .overall-card .bar-wrap { background: #0f172a; border-radius: 99px; height: 8px; margin-top: 12px; overflow: hidden; }
    .overall-card .bar-fill { height: 100%; border-radius: 99px; background: #3b82f6; }

    /* Sections */
    .section { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .section h2 { font-size: 1.1rem; color: #38bdf8; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .section h2 .badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 99px; font-weight: 600; }
    .badge-a { background: #14532d; color: #86efac; }
    .badge-b { background: #0c4a6e; color: #7dd3fc; }
    .badge-c { background: #78350f; color: #fcd34d; }
    .badge-d, .badge-f { background: #7f1d1d; color: #fca5a5; }

    /* Items */
    .item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 0.9rem; }
    .item:last-child { border-bottom: none; }
    .item .icon { font-size: 1rem; flex-shrink: 0; margin-top: 2px; }
    .item .text { color: #cbd5e1; }
    .items-group { margin-bottom: 16px; }
    .items-group .group-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; padding: 4px 8px; border-radius: 4px; display: inline-block; }
    .label-issue { background: #450a0a; color: #f87171; }
    .label-warning { background: #431407; color: #fb923c; }
    .label-passed { background: #052e16; color: #4ade80; }

    /* Data Table */
    .data-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 0.85rem; }
    .data-table th { background: #0f172a; color: #64748b; text-align: left; padding: 8px 12px; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .data-table td { padding: 8px 12px; border-bottom: 1px solid #1e293b; color: #cbd5e1; word-break: break-all; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #0f172a; }

    /* Tech stack */
    .tech-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
    .tech-tag { background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 4px 10px; font-size: 0.82rem; color: #94a3b8; }
    .tech-category { margin-bottom: 14px; }
    .tech-category .cat-name { font-size: 0.78rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }

    /* Links stats */
    .links-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .link-stat { background: #0f172a; border-radius: 8px; padding: 12px; text-align: center; }
    .link-stat .num { font-size: 1.6rem; font-weight: 700; color: #38bdf8; }
    .link-stat .lbl { font-size: 0.75rem; color: #64748b; margin-top: 2px; }
    .link-stat.broken .num { color: #ef4444; }

    /* Broken links list */
    .broken-list { margin-top: 12px; }
    .broken-item { background: #450a0a22; border: 1px solid #7f1d1d; border-radius: 6px; padding: 8px 12px; margin-bottom: 6px; font-size: 0.82rem; }
    .broken-item .status { color: #f87171; font-weight: 600; margin-right: 8px; }
    .broken-item .link-url { color: #fca5a5; word-break: break-all; }

    /* Performance metrics */
    .perf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .perf-metric { background: #0f172a; border-radius: 8px; padding: 14px; }
    .perf-metric .m-label { font-size: 0.75rem; color: #64748b; margin-bottom: 4px; }
    .perf-metric .m-value { font-size: 1.2rem; font-weight: 700; }
    .m-green { color: #22c55e; }
    .m-yellow { color: #f59e0b; }
    .m-red { color: #ef4444; }
    .m-blue { color: #38bdf8; }

    footer { text-align: center; color: #475569; font-size: 0.8rem; margin-top: 40px; padding-top: 20px; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
<div class="container">

  <!-- Header -->
  <div class="header">
    <h1>🔍 Website Analysis Report</h1>
    <div class="url">${escHtml(url)}</div>
    <div class="meta">
      <span><strong>Scanned:</strong> ${now}</span>
      <span><strong>Response Time:</strong> ${performance?.data?.responseTime ?? "—"}ms</span>
      <span><strong>HTTP Status:</strong> ${performance?.data?.statusCode ?? "—"}</span>
      <span><strong>Page Size:</strong> ${performance?.data?.pageSizeKB ?? "—"} KB</span>
    </div>
  </div>

  <!-- Score Cards -->
  <div class="scores-grid">
    ${scoreCard("SEO", seo)}
    ${scoreCard("Performance", performance)}
    ${scoreCard("Security", security)}
    ${scoreCard("Accessibility", accessibility)}
    ${scoreCard("Links", links)}
    ${scoreCard("Sitemap", sitemap)}
    ${scoreCard("Robots", robots)}
    ${scoreCard("Schema", schema)}
  </div>
  <div style="margin-bottom:28px">
    ${overallCard(summary)}
  </div>

  <!-- Tech Stack -->
  ${techStackSection(techStack)}

  <!-- SEO -->
  ${analysisSection("🔍 SEO Analysis", seo, seoDataTable(seo?.data))}

  <!-- Performance -->
  ${analysisSection("⚡ Performance", performance, perfDataSection(performance?.data))}

  <!-- Accessibility -->
  ${analysisSection("♿ Accessibility", accessibility)}

  <!-- Links -->
  ${linksSection(links)}
  ${analysisSection("🔒 Security", security)}
  ${analysisSection("🗺️ Sitemap", sitemap)}
  ${analysisSection("🤖 Robots.txt", robots)}
  ${analysisSection("📋 Schema", schema)}

  <footer>Generated by website-analyzer-cli &nbsp;|&nbsp; ${now}</footer>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────
// HTML COMPONENT BUILDERS
// ─────────────────────────────────────────

function scoreCard(label, data) {
  if (!data) return "";
  const pct = data.percentage || 0;
  const g = data.grade || { letter: "?", label: "N/A" };
  const cls = `grade-${g.letter.toLowerCase()}`;
  return `
  <div class="score-card ${cls}">
    <div class="label">${label}</div>
    <div class="score">${pct}%</div>
    <div class="grade">${g.emoji || ""} ${g.letter} — ${g.label}</div>
    <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%"></div></div>
  </div>`;
}

function overallCard(summary) {
  return `
  <div class="overall-card">
    <div class="label">Overall Score</div>
    <div class="score">${summary.overallPercentage}%</div>
    <div class="grade">${summary.overallGrade.emoji} ${summary.overallGrade.letter} — ${summary.overallGrade.label}</div>
    <div class="bar-wrap"><div class="bar-fill" style="width:${summary.overallPercentage}%"></div></div>
  </div>`;
}

function techStackSection(techStack) {
  if (!techStack || techStack.count === 0) return "";
  const cats = Object.entries(techStack.grouped)
    .map(([cat, items]) => `
      <div class="tech-category">
        <div class="cat-name">${escHtml(cat)}</div>
        <div class="tech-tags">
          ${items.map(t => `<span class="tech-tag">${t.icon} ${escHtml(t.name)}</span>`).join("")}
        </div>
      </div>`)
    .join("");
  return `
  <div class="section">
    <h2>🛠️ Tech Stack <span class="badge badge-b">${techStack.count} detected</span></h2>
    ${cats}
  </div>`;
}

function analysisSection(title, data, extraHtml = "") {
  if (!data) return "";
  const badgeCls = `badge-${(data.grade?.letter || "f").toLowerCase()}`;
  const issues = (data.issues || []).map(i =>
    `<div class="item"><span class="icon">❌</span><span class="text">${escHtml(i.msg)}</span></div>`).join("");
  const warnings = (data.warnings || []).map(w =>
    `<div class="item"><span class="icon">⚠️</span><span class="text">${escHtml(w.msg)}</span></div>`).join("");
  const passed = (data.passed || []).map(p =>
    `<div class="item"><span class="icon">✅</span><span class="text">${escHtml(p.msg)}</span></div>`).join("");

  return `
  <div class="section">
    <h2>${title} <span class="badge ${badgeCls}">${data.grade?.emoji} ${data.grade?.letter} ${data.percentage}%</span></h2>
    ${issues ? `<div class="items-group"><div class="group-label label-issue">❌ Issues — fix karo</div>${issues}</div>` : ""}
    ${warnings ? `<div class="items-group"><div class="group-label label-warning">⚠️ Warnings</div>${warnings}</div>` : ""}
    ${passed ? `<div class="items-group"><div class="group-label label-passed">✅ Passed</div>${passed}</div>` : ""}
    ${extraHtml}
  </div>`;
}

function seoDataTable(d) {
  if (!d) return "";
  const rows = [
    d.title && ["Title", escHtml(d.title)],
    d.metaDescription && ["Meta Description", escHtml(d.metaDescription.substring(0, 120) + "...")],
    d.canonical && ["Canonical", escHtml(d.canonical)],
    d.robots && ["Robots", escHtml(d.robots)],
    d.h1?.[0] && ["H1", escHtml(d.h1[0])],
    d.headings && ["Headings", `H1:${d.headings.h1} &nbsp; H2:${d.headings.h2} &nbsp; H3:${d.headings.h3} &nbsp; H4:${d.headings.h4}`],
    d.images && ["Images", `${d.images.total} total, ${d.images.missingAlt} missing alt`],
    d.viewport && ["Viewport", escHtml(d.viewport)],
    d.og?.title && ["OG Title", escHtml(d.og.title)],
    d.twitterCard && ["Twitter Card", escHtml(d.twitterCard)],
  ].filter(Boolean);

  if (rows.length === 0) return "";
  return `<table class="data-table">
    <tr><th>SEO Data</th><th>Value</th></tr>
    ${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
  </table>`;
}

function perfDataSection(d) {
  if (!d) return "";
  const rtColor = d.responseTime < 500 ? "m-green" : d.responseTime < 1500 ? "m-yellow" : "m-red";
  return `
  <div class="perf-grid">
    <div class="perf-metric"><div class="m-label">Response Time</div><div class="m-value ${rtColor}">${d.responseTime}ms</div></div>
    <div class="perf-metric"><div class="m-label">Page Size</div><div class="m-value m-blue">${d.pageSizeKB} KB</div></div>
    <div class="perf-metric"><div class="m-label">Compression</div><div class="m-value ${d.compression !== "none" ? "m-green" : "m-red"}">${d.compression !== "none" ? d.compression : "None"}</div></div>
    <div class="perf-metric"><div class="m-label">HTTPS</div><div class="m-value ${d.https ? "m-green" : "m-red"}">${d.https ? "✓ Yes" : "✗ No"}</div></div>
    <div class="perf-metric"><div class="m-label">HTTP Status</div><div class="m-value ${d.statusCode < 300 ? "m-green" : "m-red"}">${d.statusCode}</div></div>
    <div class="perf-metric"><div class="m-label">Scripts</div><div class="m-value m-blue">${d.resources?.scripts ?? "—"}</div></div>
    <div class="perf-metric"><div class="m-label">Stylesheets</div><div class="m-value m-blue">${d.resources?.stylesheets ?? "—"}</div></div>
    <div class="perf-metric"><div class="m-label">Render-blocking</div><div class="m-value ${d.renderBlockingScripts === 0 ? "m-green" : "m-red"}">${d.renderBlockingScripts}</div></div>
  </div>`;
}

function linksSection(links) {
  if (!links) return "";
  const d = links.data;
  const badgeCls = `badge-${(links.grade?.letter || "f").toLowerCase()}`;
  const brokenHtml = d.broken?.length > 0
    ? `<div class="broken-list">
        ${d.broken.slice(0, 15).map(b => `
          <div class="broken-item">
            <span class="status">[${b.status || "ERR"}]</span>
            <span class="link-url">${escHtml(b.url)}</span>
            ${b.text ? `<span style="color:#6b7280"> — "${escHtml(b.text)}"</span>` : ""}
          </div>`).join("")}
       </div>` : "";

  const issues = (links.issues || []).map(i =>
    `<div class="item"><span class="icon">❌</span><span class="text">${escHtml(i.msg)}</span></div>`).join("");
  const warnings = (links.warnings || []).map(w =>
    `<div class="item"><span class="icon">⚠️</span><span class="text">${escHtml(w.msg)}</span></div>`).join("");
  const passed = (links.passed || []).map(p =>
    `<div class="item"><span class="icon">✅</span><span class="text">${escHtml(p.msg)}</span></div>`).join("");

  return `
  <div class="section">
    <h2>🔗 Links Analysis <span class="badge ${badgeCls}">${links.grade?.emoji} ${links.grade?.letter} ${links.percentage}%</span></h2>
    <div class="links-stats">
      <div class="link-stat"><div class="num">${d.total}</div><div class="lbl">Total</div></div>
      <div class="link-stat"><div class="num">${d.internal?.length}</div><div class="lbl">Internal</div></div>
      <div class="link-stat"><div class="num">${d.external?.length}</div><div class="lbl">External</div></div>
      <div class="link-stat ${d.broken?.length > 0 ? "broken" : ""}"><div class="num">${d.broken?.length}</div><div class="lbl">Broken</div></div>
      <div class="link-stat"><div class="num">${d.redirects?.length}</div><div class="lbl">Redirects</div></div>
      <div class="link-stat"><div class="num">${d.nofollow?.length}</div><div class="lbl">Nofollow</div></div>
    </div>
    ${d.broken?.length > 0 ? `<div style="color:#f87171;font-size:.85rem;font-weight:600;margin-bottom:6px">🔴 Broken Links:</div>${brokenHtml}` : ""}
    ${issues ? `<div class="items-group" style="margin-top:12px"><div class="group-label label-issue">❌ Issues</div>${issues}</div>` : ""}
    ${warnings ? `<div class="items-group"><div class="group-label label-warning">⚠️ Warnings</div>${warnings}</div>` : ""}
    ${passed ? `<div class="items-group"><div class="group-label label-passed">✅ Passed</div>${passed}</div>` : ""}
  </div>`;
}

// ─────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────

function buildSummary(results) {
  const cats = ["seo", "performance", "accessibility", "links", "security", "sitemap", "robots", "schema"];
  let totalScore = 0, totalMax = 0;
  cats.forEach((c) => {
    if (results[c]) {
      totalScore += results[c].score || 0;
      totalMax += results[c].maxScore || 0;
    }
  });
  const overallPercentage = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  return { totalScore, totalMax, overallPercentage, overallGrade: getGrade(overallPercentage) };
}

function sanitize(data) {
  if (!data) return null;
  // $ (cheerio) aur bade objects remove karo
  const { $: _$, html: _html, ...clean } = data;
  return clean;
}

function resolveOutputPath(outputPath, ext) {
  const reportsDir = path.resolve("reports");

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  if (!outputPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    return path.join(reportsDir, `website-report-${timestamp}.${ext}`);
  }

  const base = path.basename(outputPath);
  const withExt = base.endsWith(`.${ext}`) ? base : base + `.${ext}`;
  return path.join(reportsDir, withExt);
}

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getGrade(percentage) {
  if (percentage >= 90) return { letter: "A", emoji: "🟢", label: "Excellent" };
  if (percentage >= 75) return { letter: "B", emoji: "🟡", label: "Good" };
  if (percentage >= 60) return { letter: "C", emoji: "🟠", label: "Average" };
  if (percentage >= 40) return { letter: "D", emoji: "🔴", label: "Poor" };
  return { letter: "F", emoji: "💀", label: "Very Poor" };
}

module.exports = { exportJSON, exportHTML };
