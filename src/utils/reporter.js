/**
 * Reporter — Terminal mein sundar colorful output print karta hai
 * Uses: chalk, cli-table3
 */

const chalk = require("chalk");
const Table = require("cli-table3");

// ─────────────────────────────────────────
// MAIN REPORT PRINT FUNCTION
// ─────────────────────────────────────────

function printReport(url, { seo, performance, techStack, accessibility, links }, responseTime) {
  printHeader(url, responseTime);
  printOverallScore({ seo, performance, accessibility, links });
  printTechStack(techStack);
  printSection("SEO", seo);
  printSection("Performance", performance);
  printSection("Accessibility", accessibility);
  printLinksSection(links);
  printFooter();
}

// ─────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────

function printHeader(url, responseTime) {
  const width = 60;
  const line = "─".repeat(width);

  console.log("\n" + chalk.cyan(line));
  console.log(
    chalk.cyan("│") +
      chalk.bold.white("  🔍 WEBSITE ANALYZER REPORT") +
      " ".repeat(width - 30) +
      chalk.cyan("│")
  );
  console.log(chalk.cyan(line));
  console.log(chalk.cyan("│") + "  " + chalk.yellow("URL     : ") + chalk.white(url));
  console.log(
    chalk.cyan("│") +
      "  " +
      chalk.yellow("Scanned : ") +
      chalk.white(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))
  );
  console.log(
    chalk.cyan("│") +
      "  " +
      chalk.yellow("Time    : ") +
      chalk.white(responseTime + "ms")
  );
  console.log(chalk.cyan(line) + "\n");
}

// ─────────────────────────────────────────
// OVERALL SCORE SUMMARY
// ─────────────────────────────────────────

function printOverallScore({ seo, performance, accessibility, links }) {
  console.log(chalk.bold.white("📊 OVERALL SCORES\n"));

  const categories = [
    { name: "SEO", data: seo },
    { name: "Performance", data: performance },
    { name: "Accessibility", data: accessibility },
    { name: "Links", data: links },
  ];

  const table = new Table({
    head: [
      chalk.bold.cyan("Category"),
      chalk.bold.cyan("Score"),
      chalk.bold.cyan("Grade"),
      chalk.bold.cyan("Status"),
      chalk.bold.cyan("Bar"),
    ],
    colWidths: [18, 12, 10, 14, 22],
    style: { border: ["cyan"], head: [] },
  });

  let totalScore = 0;
  let totalMax = 0;

  categories.forEach(({ name, data }) => {
    if (!data) return;
    const pct = data.percentage || 0;
    const grade = data.grade || { letter: "?", emoji: "⬜", label: "N/A" };

    totalScore += data.score || 0;
    totalMax += data.maxScore || 0;

    table.push([
      chalk.white(name),
      chalk.yellow(`${data.score}/${data.maxScore}`),
      gradeColor(grade, `${grade.emoji} ${grade.letter}`),
      gradeColor(grade, grade.label),
      progressBar(pct),
    ]);
  });

  // Overall row
  const overallPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  const overallGrade = getGrade(overallPct);
  table.push([
    chalk.bold.white("OVERALL"),
    chalk.bold.yellow(`${totalScore}/${totalMax}`),
    chalk.bold(gradeColor(overallGrade, `${overallGrade.emoji} ${overallGrade.letter}`)),
    chalk.bold(gradeColor(overallGrade, overallGrade.label)),
    progressBar(overallPct),
  ]);

  console.log(table.toString());
  console.log();
}

// ─────────────────────────────────────────
// TECH STACK
// ─────────────────────────────────────────

function printTechStack(techStack) {
  if (!techStack || techStack.count === 0) {
    console.log(chalk.bold.white("🛠️  TECH STACK\n"));
    console.log(chalk.gray("  Koi technology detect nahi hui\n"));
    return;
  }

  console.log(chalk.bold.white("🛠️  TECH STACK\n"));

  const table = new Table({
    head: [chalk.bold.cyan("Category"), chalk.bold.cyan("Technologies")],
    colWidths: [20, 50],
    style: { border: ["cyan"], head: [] },
  });

  Object.entries(techStack.grouped).forEach(([category, items]) => {
    table.push([
      chalk.yellow(category),
      items.map((t) => `${t.icon} ${chalk.white(t.name)}`).join("  "),
    ]);
  });

  console.log(table.toString());
  console.log();
}

// ─────────────────────────────────────────
// GENERIC SECTION (SEO / Performance / A11y)
// ─────────────────────────────────────────

function printSection(name, data) {
  if (!data) return;

  const icons = {
    SEO: "🔍",
    Performance: "⚡",
    Accessibility: "♿",
  };

  console.log(
    chalk.bold.white(`${icons[name] || "📋"} ${name.toUpperCase()} ANALYSIS\n`)
  );

  // Issues
  if (data.issues.length > 0) {
    console.log(chalk.red("  ❌ Issues (fix karo):"));
    data.issues.forEach((item) => {
      console.log(chalk.red("    • ") + chalk.white(item.msg));
    });
    console.log();
  }

  // Warnings
  if (data.warnings.length > 0) {
    console.log(chalk.yellow("  ⚠️  Warnings (improve karo):"));
    data.warnings.forEach((item) => {
      console.log(chalk.yellow("    • ") + chalk.white(item.msg));
    });
    console.log();
  }

  // Passed
  if (data.passed.length > 0) {
    console.log(chalk.green("  ✅ Passed:"));
    data.passed.forEach((item) => {
      console.log(chalk.green("    • ") + chalk.gray(item.msg));
    });
    console.log();
  }

  // Extra data for SEO
  if (name === "SEO" && data.data) {
    printSEOData(data.data);
  }

  // Extra data for Performance
  if (name === "Performance" && data.data) {
    printPerformanceData(data.data);
  }
}

// ─────────────────────────────────────────
// SEO EXTRA DATA
// ─────────────────────────────────────────

function printSEOData(d) {
  const table = new Table({
    head: [chalk.bold.cyan("SEO Data"), chalk.bold.cyan("Value")],
    colWidths: [22, 48],
    style: { border: ["cyan"], head: [] },
  });

  if (d.title) table.push(["Title", chalk.white(d.title.substring(0, 45))]);
  if (d.metaDescription)
    table.push(["Meta Desc", chalk.white(d.metaDescription.substring(0, 45) + "...")]);
  if (d.canonical) table.push(["Canonical", chalk.white(d.canonical.substring(0, 45))]);
  if (d.robots) table.push(["Robots", chalk.white(d.robots)]);
  if (d.h1?.[0]) table.push(["H1", chalk.white(d.h1[0].substring(0, 45))]);
  if (d.headings)
    table.push([
      "Headings",
      chalk.white(
        `H1:${d.headings.h1} H2:${d.headings.h2} H3:${d.headings.h3} H4:${d.headings.h4}`
      ),
    ]);
  if (d.images)
    table.push([
      "Images",
      chalk.white(`${d.images.total} total, ${d.images.missingAlt} missing alt`),
    ]);

  if (table.length > 0) {
    console.log(table.toString());
    console.log();
  }
}

// ─────────────────────────────────────────
// PERFORMANCE EXTRA DATA
// ─────────────────────────────────────────

function printPerformanceData(d) {
  const table = new Table({
    head: [chalk.bold.cyan("Metric"), chalk.bold.cyan("Value")],
    colWidths: [28, 42],
    style: { border: ["cyan"], head: [] },
  });

  table.push(["Response Time", speedColor(d.responseTime, `${d.responseTime}ms`)]);
  table.push(["Page Size", chalk.white(`${d.pageSizeKB} KB`)]);
  table.push(["Compression", d.compression !== "none" ? chalk.green(d.compression) : chalk.red("None")]);
  table.push(["HTTPS", d.https ? chalk.green("✓ Yes") : chalk.red("✗ No")]);
  table.push(["HTTP Status", d.statusCode >= 200 && d.statusCode < 300 ? chalk.green(d.statusCode) : chalk.red(d.statusCode)]);

  if (d.resources) {
    table.push([
      "Resources",
      chalk.white(
        `Scripts: ${d.resources.scripts} | CSS: ${d.resources.stylesheets} | Images: ${d.resources.images}`
      ),
    ]);
  }

  if (d.renderBlockingScripts !== undefined) {
    table.push([
      "Render-blocking Scripts",
      d.renderBlockingScripts === 0
        ? chalk.green("None ✓")
        : chalk.red(`${d.renderBlockingScripts} found`),
    ]);
  }

  console.log(table.toString());
  console.log();
}

// ─────────────────────────────────────────
// LINKS SECTION
// ─────────────────────────────────────────

function printLinksSection(links) {
  if (!links) return;

  console.log(chalk.bold.white("🔗 LINKS ANALYSIS\n"));

  // Summary table
  const table = new Table({
    head: [chalk.bold.cyan("Type"), chalk.bold.cyan("Count")],
    colWidths: [25, 15],
    style: { border: ["cyan"], head: [] },
  });

  table.push(["Total Links", chalk.white(links.data.total)]);
  table.push(["Internal Links", chalk.white(links.data.internal.length)]);
  table.push(["External Links", chalk.white(links.data.external.length)]);
  table.push([
    "Broken Links",
    links.data.broken.length > 0
      ? chalk.red(links.data.broken.length + " ❌")
      : chalk.green("0 ✓"),
  ]);
  table.push(["Redirects", links.data.redirects.length > 0 ? chalk.yellow(links.data.redirects.length) : chalk.green("0 ✓")]);
  table.push(["Nofollow", chalk.white(links.data.nofollow.length)]);
  if (links.data.mailto.length > 0)
    table.push(["Mailto Links", chalk.white(links.data.mailto.length)]);
  if (links.data.tel.length > 0)
    table.push(["Tel Links", chalk.white(links.data.tel.length)]);
  if (links.data.skipped > 0)
    table.push(["Skipped (limit)", chalk.gray(links.data.skipped)]);

  console.log(table.toString());

  // Broken links detail
  if (links.data.broken.length > 0) {
    console.log(chalk.red("\n  🔴 Broken Links:"));
    links.data.broken.slice(0, 10).forEach((b) => {
      console.log(
        chalk.red("    • ") +
          chalk.gray(`[${b.status || "ERR"}] `) +
          chalk.white(b.url.substring(0, 60)) +
          (b.text ? chalk.gray(` "${b.text}"`) : "")
      );
    });
    if (links.data.broken.length > 10) {
      console.log(chalk.gray(`    ... aur ${links.data.broken.length - 10} more`));
    }
  }

  // Redirects detail
  if (links.data.redirects.length > 0) {
    console.log(chalk.yellow("\n  🔀 Redirects:"));
    links.data.redirects.slice(0, 5).forEach((r) => {
      console.log(
        chalk.yellow("    • ") +
          chalk.white(r.url.substring(0, 55)) +
          chalk.gray(` → ${r.redirectUrl || "?"}`)
      );
    });
  }

  // Warnings / Issues
  if (links.issues.length > 0) {
    console.log(chalk.red("\n  ❌ Issues:"));
    links.issues.forEach((i) => console.log(chalk.red("    • ") + chalk.white(i.msg)));
  }
  if (links.warnings.length > 0) {
    console.log(chalk.yellow("\n  ⚠️  Warnings:"));
    links.warnings.forEach((w) => console.log(chalk.yellow("    • ") + chalk.white(w.msg)));
  }
  if (links.passed.length > 0) {
    console.log(chalk.green("\n  ✅ Passed:"));
    links.passed.forEach((p) => console.log(chalk.green("    • ") + chalk.gray(p.msg)));
  }

  console.log();
}

// ─────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────

function printFooter() {
  const line = "─".repeat(60);
  console.log(chalk.cyan(line));
  console.log(
    chalk.gray("  Made with ❤️  | website-analyzer-cli | github.com/website-analyzer")
  );
  console.log(chalk.cyan(line) + "\n");
}

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────

function progressBar(pct) {
  const filled = Math.round(pct / 5);
  const empty = 20 - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  const color = pct >= 75 ? chalk.green : pct >= 50 ? chalk.yellow : chalk.red;
  return color(bar) + chalk.gray(` ${pct}%`);
}

function gradeColor(grade, text) {
  if (!grade) return chalk.gray(text);
  const pct = grade.percentage;
  if (grade.letter === "A") return chalk.green(text);
  if (grade.letter === "B") return chalk.cyan(text);
  if (grade.letter === "C") return chalk.yellow(text);
  if (grade.letter === "D") return chalk.red(text);
  return chalk.bgRed.white(text);
}

function speedColor(ms, text) {
  if (ms < 500) return chalk.green(text);
  if (ms < 1500) return chalk.yellow(text);
  return chalk.red(text);
}

function getGrade(percentage) {
  if (percentage >= 90) return { letter: "A", emoji: "🟢", label: "Excellent" };
  if (percentage >= 75) return { letter: "B", emoji: "🟡", label: "Good" };
  if (percentage >= 60) return { letter: "C", emoji: "🟠", label: "Average" };
  if (percentage >= 40) return { letter: "D", emoji: "🔴", label: "Poor" };
  return { letter: "F", emoji: "💀", label: "Very Poor" };
}

// Simple spinner alternative (ora ke bina bhi kaam kare)
function printSpinner(text) {
  process.stdout.write(chalk.cyan("  ⏳ ") + chalk.white(text) + "\r");
}

function clearLine() {
  process.stdout.write("\r" + " ".repeat(70) + "\r");
}

module.exports = { printReport, printHeader, printSection, printSpinner, clearLine };
