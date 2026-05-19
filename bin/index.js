#!/usr/bin/env node

/**
 * CLI Entry Point
 * Usage: website-analyzer <url> [options]
 */

const { Command } = require("commander");
const chalk = require("chalk");
const { analyze } = require("../src/index");

const pkg = require("../package.json");

// ─────────────────────────────────────────
// CLI SETUP
// ─────────────────────────────────────────

const program = new Command();

program
  .name("website-analyzer")
  .description(
    chalk.cyan("🔍 Analyze any website — SEO, Performance, Tech Stack, Accessibility & Links")
  )
  .version(pkg.version, "-v, --version", "Version dikhao")
  .argument("<url>", "Website URL to analyze (e.g. https://google.com)")
  .option("--json", "Output results as JSON (terminal mein)")
  .option(
    "--only <modules>",
    "Sirf specific modules run karo (comma-separated: seo,performance,tech,accessibility,links)",
    parseModules
  )
  .option("--export <path>", "Report file mein save karo (e.g. --export ./report)")
  .option(
    "--format <format>",
    "Export format: html | json | both (default: html)",
    "html"
  )
  .option("--no-links", "Link checking skip karo (faster results)")
  .option("--silent", "Spinners aur progress mat dikhao")
  .addHelpText(
    "after",
    `
${chalk.bold.yellow("Examples:")}
  ${chalk.gray("$")} ${chalk.cyan("website-analyzer")} https://google.com
  ${chalk.gray("$")} ${chalk.cyan("website-analyzer")} https://mysite.com ${chalk.gray("--export ./reports/mysite")}
  ${chalk.gray("$")} ${chalk.cyan("website-analyzer")} https://mysite.com ${chalk.gray("--format both")}
  ${chalk.gray("$")} ${chalk.cyan("website-analyzer")} https://mysite.com ${chalk.gray("--only seo,performance")}
  ${chalk.gray("$")} ${chalk.cyan("website-analyzer")} https://mysite.com ${chalk.gray("--json")}
  ${chalk.gray("$")} ${chalk.cyan("website-analyzer")} https://mysite.com ${chalk.gray("--no-links --silent")}

${chalk.bold.yellow("Modules (--only):")}
  ${chalk.green("seo")}             Title, meta, OG tags, headings, schema
  ${chalk.green("performance")}     Response time, compression, caching, HTTPS
  ${chalk.green("tech")}            Framework, CMS, analytics, hosting detection
  ${chalk.green("accessibility")}   Alt text, ARIA, forms, headings, landmarks
  ${chalk.green("links")}           Broken links, redirects, internal/external

${chalk.bold.yellow("Export Formats:")}
  ${chalk.green("html")}            Beautiful dark-themed HTML report (default)
  ${chalk.green("json")}            Machine-readable JSON report
  ${chalk.green("both")}            Dono export karo
    `
  );

// ─────────────────────────────────────────
// PARSE + RUN
// ─────────────────────────────────────────

program.action(async (url, options) => {
  printBanner();

  try {
    await analyze(url, {
      only: options.only || null,
      json: options.json || false,
      export: options.export || null,
      exportFormat: options.format || "html",
      noLinks: !options.links,     // commander --no-links → options.links = false
      silent: options.silent || false,
    });

    process.exit(0);
  } catch (err) {
    console.error("\n" + chalk.red("❌ Error: ") + chalk.white(err.message));

    // Helpful hints
    if (err.message.includes("nahi mila") || err.message.includes("ENOTFOUND")) {
      console.error(chalk.gray("  → URL check karo, internet connection dekho"));
    } else if (err.message.includes("Invalid URL")) {
      console.error(chalk.gray("  → Example: website-analyzer https://google.com"));
    } else if (err.message.includes("Timeout")) {
      console.error(chalk.gray("  → Site bahut slow hai ya respond nahi kar rahi"));
    }

    console.error(chalk.gray("\n  Help ke liye: website-analyzer --help\n"));
    process.exit(1);
  }
});

// ─────────────────────────────────────────
// BANNER
// ─────────────────────────────────────────

function printBanner() {
  console.log(
    chalk.cyan(`
  ╦ ╦╔═╗╔╗ ╔═╗╦╔╦╗╔═╗  ╔═╗╔╗╔╔═╗╦  ╦ ╦╔═╗╔═╗╦═╗
  ║║║║╣ ╠╩╗╚═╗║ ║ ║╣   ╠═╣║║║╠═╣║  ╚╦╝╔═╝║╣ ╠╦╝
  ╚╩╝╚═╝╚═╝╚═╝╩ ╩ ╚═╝  ╩ ╩╝╚╝╩ ╩╩═╝ ╩ ╚═╝╚═╝╩╚═
    `) +
    chalk.gray(`  v${pkg.version} — SEO · Performance · Tech Stack · Accessibility · Links\n`)
  );
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function parseModules(val) {
  const valid = ["seo", "performance", "tech", "accessibility", "links", "security"];
  const modules = val.split(",").map((m) => m.trim().toLowerCase());
  const invalid = modules.filter((m) => !valid.includes(m));

  if (invalid.length > 0) {
    console.error(
      chalk.red(`\n❌ Invalid modules: ${invalid.join(", ")}`) +
      chalk.gray(`\n   Valid options: ${valid.join(", ")}\n`)
    );
    process.exit(1);
  }

  return modules;
}

// ─────────────────────────────────────────
// UNHANDLED ERRORS
// ─────────────────────────────────────────

process.on("unhandledRejection", (err) => {
  console.error(chalk.red("\n❌ Unexpected error: ") + err.message);
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log(chalk.yellow("\n\n  ⚠️  Analysis interrupted by user\n"));
  process.exit(0);
});

// ─────────────────────────────────────────
// RUN
// ─────────────────────────────────────────

program.parse(process.argv);

// No args diye to help dikhao
if (process.argv.length < 3) {
  program.help();
}
