/**
 * bundle.js — Core engine ko Cloudflare Workers ke liye bundle karta hai
 * Run: node scripts/bundle.js
 */

const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "../../..");
const CORE_ENTRY = path.join(ROOT, "packages/core/src/index.js");
const OUT_DIR = path.join(__dirname, "../dist");
const OUT_FILE = path.join(OUT_DIR, "core.bundle.js");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ─────────────────────────────────────────
// STUBS
// ─────────────────────────────────────────

const stubs = {
  // ora — no spinners in Workers
  "ora": `module.exports = function(){ return { start(){return this}, succeed(){return this}, fail(){return this}, warn(){return this}, stop(){return this}, text:'' }; };`,

  // chalk — just return string as-is
  "chalk": `
    const fn = (s) => String(s ?? '');
    const proxy = new Proxy(fn, {
      get(t, k) {
        if (k === 'bold' || k === 'dim' || k === 'italic' || k === 'underline') return proxy;
        if (typeof fn[k] === 'function') return fn[k];
        return proxy;
      }
    });
    fn.bold = proxy; fn.dim = proxy; fn.italic = proxy;
    fn.cyan = proxy; fn.green = proxy; fn.red = proxy;
    fn.yellow = proxy; fn.gray = proxy; fn.white = proxy;
    fn.blue = proxy; fn.magenta = proxy; fn.bgRed = proxy;
    module.exports = proxy;
  `,

  // cli-table3 — stub table
  "cli-table3": `module.exports = class Table { constructor(){this.rows=[]} push(r){this.rows.push(r)} toString(){return JSON.stringify(this.rows)} get length(){return this.rows.length} };`,

  // fs — Workers mein filesystem nahi hota
  "fs": `
    module.exports = {
      writeFileSync() {},
      readFileSync() { return ''; },
      existsSync() { return false; },
      mkdirSync() {},
      statSync() { return { size: 0 }; },
      createWriteStream() { return { write(){}, end(){} }; },
    };
  `,

  // path — basic implementation (Workers mein node:path available nahi always)
  "path": `
    module.exports = {
      join(...parts) { return parts.filter(Boolean).join('/').replace(/\\/+/g, '/'); },
      resolve(...parts) { return parts.filter(Boolean).join('/').replace(/\\/+/g, '/'); },
      basename(p, ext) { const b = p.split('/').pop(); return ext && b.endsWith(ext) ? b.slice(0,-ext.length) : b; },
      dirname(p) { return p.split('/').slice(0,-1).join('/') || '.'; },
      extname(p) { const b = p.split('/').pop(); const i = b.lastIndexOf('.'); return i > 0 ? b.slice(i) : ''; },
    };
  `,
};

// ─────────────────────────────────────────
// BUNDLE
// ─────────────────────────────────────────

async function bundle() {
  console.log("📦 Bundling core engine for Cloudflare Workers...");

  await esbuild.build({
    entryPoints: [CORE_ENTRY],
    bundle: true,
    outfile: OUT_FILE,

    // ✅ Workers ke liye — browser platform, ESM format
    platform: "browser",
    target: "es2022",
    format: "cjs",          // analyze.js mein require() use ho raha hai isliye cjs

    minify: false,
    treeShaking: true,
    sourcemap: false,

    // ✅ Node builtins — Workers mein node: prefix se available hain (nodejs_compat flag ke saath)
    external: [
      "node:stream", "node:util", "node:http", "node:https",
      "node:url", "node:crypto", "node:os", "node:tty",
      "node:events", "node:net", "node:tls", "node:assert",
      "node:http2", "node:zlib", "node:buffer", "node:querystring",
    ],

    plugins: [{
      name: "workers-stubs",
      setup(build) {
        // Har stub ke liye resolver + loader set karo
        Object.entries(stubs).forEach(([moduleName, contents]) => {
          const stubId = `${moduleName}-stub`;
          build.onResolve(
            { filter: new RegExp(`^${moduleName.replace("/", "\\/")}$`) },
            () => ({ path: stubId, namespace: "workers-stub" })
          );
          build.onLoad(
            { filter: new RegExp(`^${stubId}$`), namespace: "workers-stub" },
            () => ({ contents, loader: "js" })
          );
        });

        // axios — Node http ke bajaye globalThis.fetch use karo
        build.onResolve({ filter: /^axios$/ }, () => ({
          path: "axios-fetch-stub",
          namespace: "workers-stub",
        }));
        build.onLoad(
          { filter: /^axios-fetch-stub$/, namespace: "workers-stub" },
          () => ({
            contents: `
              async function axiosGet(url, config = {}) {
                const headers = {
                  'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzerAPI/1.0)',
                  'Accept': 'text/html,application/xhtml+xml,*/*',
                  'Accept-Language': 'en-US,en;q=0.5',
                  ...(config.headers || {}),
                };
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), config.timeout || 15000);
                try {
                  const res = await fetch(url, {
                    method: 'GET',
                    headers,
                    redirect: 'follow',
                    signal: controller.signal,
                  });
                  const text = await res.text();
                  const resHeaders = {};
                  res.headers.forEach((v, k) => { resHeaders[k] = v; });
                  return { data: text, status: res.status, headers: resHeaders, request: { res: { responseUrl: res.url } } };
                } finally {
                  clearTimeout(timer);
                }
              }
              const axios = { get: axiosGet };
              axios.default = axios;
              module.exports = axios;
            `,
            loader: "js",
          })
        );
      },
    }],

    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env": "{}",
      "process.platform": '"linux"',
      "process.version": '"v18.0.0"',
    },

    logLevel: "info",
  });

  const size = fs.statSync(OUT_FILE).size;
  console.log(`✅ Bundle ready: dist/core.bundle.js (${Math.round(size / 1024)}KB)`);
  console.log(`\n👉 Ab chalao: npx wrangler dev`);
}

bundle().catch((err) => {
  console.error("❌ Bundle failed:", err.message);
  process.exit(1);
});
