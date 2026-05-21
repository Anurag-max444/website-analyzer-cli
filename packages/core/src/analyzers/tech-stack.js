/**
 * Tech Stack Analyzer
 * Detects: Frameworks, CMS, Analytics, CDN, Server, Libraries, etc.
 */

// ─────────────────────────────────────────
// DETECTION SIGNATURES
// ─────────────────────────────────────────

const SIGNATURES = {
  // ── JS FRAMEWORKS ──
  frameworks: [
    {
      name: "Next.js",
      category: "Framework",
      icon: "⬛",
      checks: [
        { type: "html", pattern: /__NEXT_DATA__/ },
        { type: "html", pattern: /next\.js/i },
        { type: "meta", name: "generator", pattern: /next\.js/i },
      ],
    },
    {
      name: "React",
      category: "Framework",
      icon: "⚛️",
      checks: [
        { type: "html", pattern: /react(?:\.min)?\.js|react-dom/i },
        { type: "html", pattern: /data-reactroot|data-reactid/ },
        { type: "html", pattern: /__react/i },
        { type: "script_src", pattern: /react/i },
      ],
    },
    {
      name: "Vue.js",
      category: "Framework",
      icon: "💚",
      checks: [
        { type: "html", pattern: /vue(?:\.min)?\.js|vue@/i },
        { type: "html", pattern: /data-v-[a-f0-9]+/ },
        { type: "html", pattern: /__vue__/i },
        { type: "script_src", pattern: /vue(\.min)?\.js/i },
      ],
    },
    {
      name: "Angular",
      category: "Framework",
      icon: "🔴",
      checks: [
        { type: "html", pattern: /ng-version=|ng-app=/ },
        { type: "html", pattern: /angular(?:\.min)?\.js/i },
        { type: "script_src", pattern: /angular/i },
      ],
    },
    {
      name: "Nuxt.js",
      category: "Framework",
      icon: "💚",
      checks: [
        { type: "html", pattern: /__NUXT__|nuxt/i },
        { type: "meta", name: "generator", pattern: /nuxt/i },
      ],
    },
    {
      name: "Svelte",
      category: "Framework",
      icon: "🟠",
      checks: [
        { type: "html", pattern: /svelte/i },
        { type: "script_src", pattern: /svelte/i },
      ],
    },
    {
      name: "Remix",
      category: "Framework",
      icon: "⬛",
      checks: [{ type: "html", pattern: /__remixContext|remix/i }],
    },
    {
      name: "Gatsby",
      category: "Framework",
      icon: "💜",
      checks: [
        { type: "html", pattern: /gatsby/i },
        { type: "meta", name: "generator", pattern: /gatsby/i },
      ],
    },
    {
      name: "Astro",
      category: "Framework",
      icon: "🚀",
      checks: [
        { type: "html", pattern: /astro-island|astro-slot/ },
        { type: "meta", name: "generator", pattern: /astro/i },
      ],
    },
  ],

  // ── CMS ──
  cms: [
    {
      name: "WordPress",
      category: "CMS",
      icon: "🔵",
      checks: [
        { type: "html", pattern: /wp-content|wp-includes/ },
        { type: "meta", name: "generator", pattern: /wordpress/i },
        { type: "header", name: "x-powered-by", pattern: /wordpress/i },
      ],
    },
    {
      name: "Shopify",
      category: "E-Commerce",
      icon: "🟢",
      checks: [
        { type: "html", pattern: /shopify/i },
        { type: "meta", name: "generator", pattern: /shopify/i },
        { type: "header", name: "x-shopify-stage", pattern: /.*/ },
      ],
    },
    {
      name: "Webflow",
      category: "Website Builder",
      icon: "🔷",
      checks: [
        { type: "html", pattern: /webflow/i },
        { type: "meta", name: "generator", pattern: /webflow/i },
        { type: "header", name: "x-powered-by", pattern: /webflow/i },
      ],
    },
    {
      name: "Wix",
      category: "Website Builder",
      icon: "⬛",
      checks: [
        { type: "html", pattern: /wix\.com|wixsite/i },
        { type: "meta", name: "generator", pattern: /wix/i },
      ],
    },
    {
      name: "Squarespace",
      category: "Website Builder",
      icon: "⬛",
      checks: [
        { type: "html", pattern: /squarespace/i },
        { type: "meta", name: "generator", pattern: /squarespace/i },
      ],
    },
    {
      name: "Ghost",
      category: "CMS",
      icon: "👻",
      checks: [
        { type: "meta", name: "generator", pattern: /ghost/i },
        { type: "html", pattern: /ghost\.io|ghost-url/i },
      ],
    },
    {
      name: "Drupal",
      category: "CMS",
      icon: "💧",
      checks: [
        { type: "meta", name: "generator", pattern: /drupal/i },
        { type: "html", pattern: /drupal/i },
        { type: "header", name: "x-generator", pattern: /drupal/i },
      ],
    },
    {
      name: "Joomla",
      category: "CMS",
      icon: "🟡",
      checks: [
        { type: "meta", name: "generator", pattern: /joomla/i },
        { type: "html", pattern: /joomla/i },
      ],
    },
  ],

  // ── CSS FRAMEWORKS ──
  css: [
    {
      name: "Tailwind CSS",
      category: "CSS Framework",
      icon: "🎨",
      checks: [
        { type: "html", pattern: /tailwind/i },
        { type: "html", pattern: /class="[^"]*(?:flex|grid|px-|py-|text-|bg-|border-)[^"]*"/ },
        { type: "link_href", pattern: /tailwind/i },
      ],
    },
    {
      name: "Bootstrap",
      category: "CSS Framework",
      icon: "🟣",
      checks: [
        { type: "html", pattern: /bootstrap/i },
        { type: "link_href", pattern: /bootstrap/i },
        { type: "script_src", pattern: /bootstrap/i },
      ],
    },
    {
      name: "Material UI",
      category: "CSS Framework",
      icon: "🔵",
      checks: [
        { type: "html", pattern: /MuiBox|MuiButton|MuiTypography/ },
        { type: "html", pattern: /material-ui/i },
      ],
    },
    {
      name: "Chakra UI",
      category: "CSS Framework",
      icon: "🟢",
      checks: [{ type: "html", pattern: /chakra-ui|css-[a-z0-9]+ chakra/i }],
    },
  ],

  // ── ANALYTICS ──
  analytics: [
    {
      name: "Google Analytics",
      category: "Analytics",
      icon: "📊",
      checks: [
        { type: "html", pattern: /google-analytics\.com|gtag\(|ga\(/ },
        { type: "script_src", pattern: /google-analytics|googletagmanager/i },
      ],
    },
    {
      name: "Google Tag Manager",
      category: "Analytics",
      icon: "🏷️",
      checks: [
        { type: "html", pattern: /googletagmanager\.com\/gtm/i },
        { type: "script_src", pattern: /googletagmanager/i },
      ],
    },
    {
      name: "Hotjar",
      category: "Analytics",
      icon: "🔥",
      checks: [{ type: "html", pattern: /hotjar/i }],
    },
    {
      name: "Mixpanel",
      category: "Analytics",
      icon: "📈",
      checks: [{ type: "html", pattern: /mixpanel/i }],
    },
    {
      name: "Plausible",
      category: "Analytics",
      icon: "📉",
      checks: [{ type: "script_src", pattern: /plausible\.io/i }],
    },
    {
      name: "Clarity (Microsoft)",
      category: "Analytics",
      icon: "🔍",
      checks: [{ type: "html", pattern: /clarity\.ms/i }],
    },
  ],

  // ── SERVER / HOSTING ──
  server: [
    {
      name: "Vercel",
      category: "Hosting",
      icon: "⬛",
      checks: [
        { type: "header", name: "x-vercel-id", pattern: /.*/ },
        { type: "header", name: "server", pattern: /vercel/i },
      ],
    },
    {
      name: "Netlify",
      category: "Hosting",
      icon: "🟦",
      checks: [
        { type: "header", name: "x-nf-request-id", pattern: /.*/ },
        { type: "header", name: "server", pattern: /netlify/i },
      ],
    },
    {
      name: "Cloudflare",
      category: "CDN/Proxy",
      icon: "🟠",
      checks: [
        { type: "header", name: "cf-ray", pattern: /.*/ },
        { type: "header", name: "server", pattern: /cloudflare/i },
      ],
    },
    {
      name: "AWS (Amazon)",
      category: "Hosting",
      icon: "🟡",
      checks: [
        { type: "header", name: "x-amz-cf-id", pattern: /.*/ },
        { type: "header", name: "x-amzn-requestid", pattern: /.*/ },
        { type: "header", name: "server", pattern: /amazons3|awselb/i },
      ],
    },
    {
      name: "GitHub Pages",
      category: "Hosting",
      icon: "⬛",
      checks: [{ type: "header", name: "server", pattern: /github\.com/i }],
    },
    {
      name: "Nginx",
      category: "Server",
      icon: "🟢",
      checks: [{ type: "header", name: "server", pattern: /nginx/i }],
    },
    {
      name: "Apache",
      category: "Server",
      icon: "🔴",
      checks: [{ type: "header", name: "server", pattern: /apache/i }],
    },
  ],

  // ── JS LIBRARIES ──
  libraries: [
    {
      name: "jQuery",
      category: "Library",
      icon: "🔵",
      checks: [
        { type: "html", pattern: /jquery(?:\.min)?\.js/i },
        { type: "html", pattern: /jquery\/[0-9]/ },
        { type: "script_src", pattern: /jquery/i },
      ],
    },
    {
      name: "Lodash",
      category: "Library",
      icon: "🟡",
      checks: [{ type: "script_src", pattern: /lodash/i }],
    },
    {
      name: "GSAP",
      category: "Animation",
      icon: "✨",
      checks: [{ type: "script_src", pattern: /gsap/i }],
    },
    {
      name: "Three.js",
      category: "3D",
      icon: "🧊",
      checks: [{ type: "script_src", pattern: /three(?:\.min)?\.js/i }],
    },
    {
      name: "Chart.js",
      category: "Charts",
      icon: "📊",
      checks: [{ type: "script_src", pattern: /chart(?:\.min)?\.js/i }],
    },
    {
      name: "Stripe",
      category: "Payments",
      icon: "💳",
      checks: [{ type: "script_src", pattern: /stripe/i }],
    },
    {
      name: "Intercom",
      category: "Chat",
      icon: "💬",
      checks: [{ type: "html", pattern: /intercom/i }],
    },
  ],
};

// ─────────────────────────────────────────
// MAIN ANALYZER FUNCTION
// ─────────────────────────────────────────

function analyzeTechStack($, headers = {}) {
  const html = $.html();
  const detected = [];

  // Script srcs collect karo
  const scriptSrcs = [];
  $("script[src]").each((i, el) => {
    scriptSrcs.push($(el).attr("src") || "");
  });

  // Link hrefs collect karo
  const linkHrefs = [];
  $("link[href]").each((i, el) => {
    linkHrefs.push($(el).attr("href") || "");
  });

  // Lowercase headers
  const lowerHeaders = {};
  Object.keys(headers).forEach((k) => {
    lowerHeaders[k.toLowerCase()] = String(headers[k]).toLowerCase();
  });

  // Sab categories check karo
  const allSignatures = [
    ...SIGNATURES.frameworks,
    ...SIGNATURES.cms,
    ...SIGNATURES.css,
    ...SIGNATURES.analytics,
    ...SIGNATURES.server,
    ...SIGNATURES.libraries,
  ];

  for (const tech of allSignatures) {
    let found = false;

    for (const check of tech.checks) {
      if (found) break;

      switch (check.type) {
        case "html":
          if (check.pattern.test(html)) found = true;
          break;

        case "meta":
          const metaContent = $(`meta[name="${check.name}"]`).attr("content") || "";
          if (check.pattern.test(metaContent)) found = true;
          break;

        case "script_src":
          if (scriptSrcs.some((src) => check.pattern.test(src))) found = true;
          break;

        case "link_href":
          if (linkHrefs.some((href) => check.pattern.test(href))) found = true;
          break;

        case "header":
          const headerVal = lowerHeaders[check.name.toLowerCase()] || "";
          if (headerVal && check.pattern.test(headerVal)) found = true;
          break;
      }
    }

    if (found) {
      detected.push({
        name: tech.name,
        category: tech.category,
        icon: tech.icon,
      });
    }
  }

  // Categories mein group karo
  const grouped = {};
  detected.forEach((tech) => {
    if (!grouped[tech.category]) grouped[tech.category] = [];
    grouped[tech.category].push(tech);
  });

  return {
    detected,
    grouped,
    count: detected.length,
    summary: detected.map((t) => `${t.icon} ${t.name}`).join(", ") || "Nothing detected",
  };
}

module.exports = { analyzeTechStack };
