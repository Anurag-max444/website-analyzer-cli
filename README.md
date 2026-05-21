# 🔍 Website Analyzer CLI

> Analyze any website in seconds — SEO, Performance, Tech Stack, Accessibility & Broken Links, all from your terminal.

[![npm version](https://img.shields.io/npm/v/website-analyzer-cli.svg?style=flat-square&color=cyan)](https://www.npmjs.com/package/website-analyzer-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen?style=flat-square)](https://nodejs.org)

```
╦ ╦╔═╗╔╗ ╔═╗╦╔╦╗╔═╗  ╔═╗╔╗╔╔═╗╦  ╦ ╦╔═╗╔═╗╦═╗
║║║║╣ ╠╩╗╚═╗║ ║ ║╣   ╠═╣║║║╠═╣║  ╚╦╝╔═╝║╣ ╠╦╝
╚╩╝╚═╝╚═╝╚═╝╩ ╩ ╚═╝  ╩ ╩╝╚╝╩ ╩╩═╝ ╩ ╚═╝╚═╝╩╚═
```

---

## ✨ Features

| Module | What it checks |
|--------|----------------|
| 🔍 **SEO** | Title, meta description, OG tags, canonical, robots, headings, schema |
| ⚡ **Performance** | Response time, HTTPS, compression, caching, render-blocking scripts |
| 🛠️ **Tech Stack** | React, Vue, Next.js, WordPress, Shopify, Tailwind, GTM, Cloudflare, 40+ more |
| ♿ **Accessibility** | Alt text, ARIA landmarks, form labels, heading hierarchy, zoom, lang |
| 🔗 **Links** | Broken links, redirects, internal/external count, nofollow |

---

## 🚀 Quick Start

### npx (no install needed)
```bash
npx website-analyzer-cli https://yoursite.com
```

### Global install
```bash
npm install -g website-analyzer-cli
website-analyzer https://yoursite.com
```

---

## 📖 Usage

```bash
website-analyzer <url> [options]
```

### Options

| Flag | Description |
|------|-------------|
| `--json` | Print JSON output in terminal |
| `--only <modules>` | Run only specific modules |
| `--export <path>` | Save report to file |
| `--format <format>` | Export format: `html` \| `json` \| `both` |
| `--no-links` | Skip link checking (faster) |
| `--silent` | Hide spinners and progress |
| `--lang <lang>` | Language: `en` (default) \| `hi` (Hinglish) |
| `-v, --version` | Show version |
| `-h, --help` | Show help |

---

## 💡 Examples

```bash
# Basic analysis (English output — default)
website-analyzer https://google.com

# Hinglish output
website-analyzer https://google.com --lang hi

# HTML report export
website-analyzer https://mysite.com --export ./reports/mysite

# Export both JSON + HTML
website-analyzer https://mysite.com --export ./report --format both

# Run only SEO and Performance
website-analyzer https://mysite.com --only seo,performance

# JSON output (for CI/CD pipelines)
website-analyzer https://mysite.com --json

# Fast scan (skip link checking)
website-analyzer https://mysite.com --no-links

# Silent mode (only show final report)
website-analyzer https://mysite.com --silent --export ./report
```

---

## 📊 Sample Output

```
────────────────────────────────────────────────────────────
│  🔍 WEBSITE ANALYZER REPORT                              │
────────────────────────────────────────────────────────────
│  URL     : https://mycompany.com
│  Scanned : 19/5/2026, 9:30:00 am
│  Time    : 342ms
────────────────────────────────────────────────────────────

📊 OVERALL SCORES

┌──────────────────┬────────────┬──────────┬──────────────┬──────────────────────┐
│ Category         │ Score      │ Grade    │ Status       │ Bar                  │
├──────────────────┼────────────┼──────────┼──────────────┼──────────────────────┤
│ SEO              │ 62/72      │ 🟢 A     │ Excellent    │ ████████████████████ │
│ Performance      │ 74/88      │ 🟡 B     │ Good         │ ████████████████░░░░ │
│ Accessibility    │ 80/94      │ 🟢 A     │ Excellent    │ █████████████████░░░ │
│ Links            │ 48/51      │ 🟢 A     │ Excellent    │ ███████████████████░ │
│ OVERALL          │ 264/305    │ 🟡 B     │ Good         │ █████████████████░░░ │
└──────────────────┴────────────┴──────────┴──────────────┴──────────────────────┘
```

---

## 🌐 Language Support

Output language can be switched with the `--lang` flag:

```bash
# English (default)
website-analyzer https://example.com

# Hinglish
website-analyzer https://example.com --lang hi
```

---

## 📁 Project Structure

```
website-analyzer/
├── bin/
│   └── index.js              # CLI entry point
├── src/
│   ├── analyzers/
│   │   ├── seo.js            # SEO analysis
│   │   ├── performance.js    # Performance metrics
│   │   ├── tech-stack.js     # Technology detection
│   │   ├── accessibility.js  # Accessibility checks
│   │   └── links.js          # Link validation
│   ├── utils/
│   │   ├── fetcher.js        # URL fetching + parsing
│   │   ├── reporter.js       # Terminal output
│   │   ├── exporter.js       # JSON/HTML export
│   │   └── lang.js           # Language strings (en / hi)
│   └── index.js              # Main orchestrator
└── package.json
```

---

## 🛠️ Tech Stack Detected (40+ technologies)

**Frameworks:** Next.js, React, Vue.js, Angular, Nuxt, Svelte, Remix, Gatsby, Astro

**CMS:** WordPress, Shopify, Webflow, Wix, Squarespace, Ghost, Drupal, Joomla

**CSS:** Tailwind CSS, Bootstrap, Material UI, Chakra UI

**Analytics:** Google Analytics, Google Tag Manager, Hotjar, Mixpanel, Plausible, Clarity

**Hosting:** Vercel, Netlify, Cloudflare, AWS, GitHub Pages

**Server:** Nginx, Apache

**Libraries:** jQuery, Lodash, GSAP, Three.js, Chart.js, Stripe, Intercom

---

## 🎯 Grading System

| Grade | Score | Label |
|-------|-------|-------|
| 🟢 A | 90%+ | Excellent |
| 🟡 B | 75%+ | Good |
| 🟠 C | 60%+ | Average |
| 🔴 D | 40%+ | Poor |
| 💀 F | <40% | Very Poor |

---

## 🔧 Use as a Node.js Module

```javascript
const { analyze } = require('website-analyzer-cli');

const results = await analyze('https://mysite.com', {
  only: ['seo', 'performance'],
  noLinks: true,
  silent: true,
  export: './report',
  exportFormat: 'both',
});

console.log(results.seo.percentage);        // 85
console.log(results.techStack.detected);    // [{name: 'React', ...}]
console.log(results.links.data.broken);     // broken links array
```

---

## 🤝 Contributing

Pull requests welcome! To add a new technology or check:

1. Fork the repo
2. Create a branch: `git checkout -b feature/add-new-tech`
3. Add to `SIGNATURES` array in `src/analyzers/tech-stack.js`
4. Submit a PR

---

## 📋 Requirements

- Node.js >= 16.0.0
- npm >= 7.0.0

---

## 📄 License

MIT © [website-analyzer-cli](https://github.com/website-analyzer)

---

<div align="center">
  <strong>Made with ❤️ for developers, marketers, and agencies</strong><br/>
  <sub>Star ⭐ if this helped you!</sub>
</div>
