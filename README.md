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

| Module | Kya check karta hai |
|--------|-------------------|
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
| `--json` | Terminal mein JSON output print karo |
| `--only <modules>` | Sirf specific modules run karo |
| `--export <path>` | Report file mein save karo |
| `--format <format>` | Export format: `html` \| `json` \| `both` |
| `--no-links` | Link checking skip karo (faster) |
| `--silent` | Spinners aur progress mat dikhao |
| `-v, --version` | Version dikhao |
| `-h, --help` | Help dikhao |

---

## 💡 Examples

```bash
# Basic analysis
website-analyzer https://google.com

# HTML report export
website-analyzer https://mysite.com --export ./reports/mysite

# JSON + HTML dono export
website-analyzer https://mysite.com --export ./report --format both

# Sirf SEO aur Performance check karo
website-analyzer https://mysite.com --only seo,performance

# JSON output (CI/CD pipelines ke liye)
website-analyzer https://mysite.com --json

# Fast scan (links skip)
website-analyzer https://mysite.com --no-links

# Silent mode (sirf report dikhao)
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

🛠️  TECH STACK

┌────────────────────┬──────────────────────────────────────────────────┐
│ Framework          │ ⬛ Next.js                                       │
│ CSS Framework      │ 🎨 Tailwind CSS                                  │
│ Analytics          │ 📊 Google Analytics  🏷️ Google Tag Manager       │
│ Hosting            │ ⬛ Vercel                                        │
└────────────────────┴──────────────────────────────────────────────────┘
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
│   │   └── exporter.js       # JSON/HTML export
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

## 📤 HTML Report

Export karo ek sundar dark-themed HTML report:

```bash
website-analyzer https://mysite.com --export ./my-report
```

Report mein milega:
- Overall score cards with progress bars
- Per-category grades
- Tech stack tags
- Issues ❌ / Warnings ⚠️ / Passed ✅
- Broken links list
- Performance metrics grid

---

## 🔧 Use as a Node.js Module

```javascript
const { analyze } = require('website-analyzer-cli');

const results = await analyze('https://mysite.com', {
  only: ['seo', 'performance'],   // sirf yeh modules
  noLinks: true,                   // links skip
  silent: true,                    // no terminal output
  export: './report',              // file export
  exportFormat: 'both',            // html + json
});

console.log(results.seo.percentage);        // 85
console.log(results.techStack.detected);    // [{name: 'React', ...}]
console.log(results.links.data.broken);     // broken links array
```

---

## 🤝 Contributing

Pull requests welcome! Naya technology detect karna ho ya naya check add karna ho:

1. Fork karo
2. Branch banao: `git checkout -b feature/add-new-tech`
3. `src/analyzers/tech-stack.js` mein SIGNATURES array mein add karo
4. PR bhejo

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
  <sub>Star ⭐ karo agar kaam aaya!</sub>
</div>
