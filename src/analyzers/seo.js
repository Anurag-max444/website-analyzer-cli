/**
 * SEO Analyzer
 * Checks: Title, Meta Description, OG Tags, Twitter Cards,
 *         Canonical, Robots, Headings, Images alt text, Schema
 */

function analyzeSEO($, url) {
  const results = {
    score: 0,
    maxScore: 0,
    issues: [],
    warnings: [],
    passed: [],
    data: {},
  };

  // ─────────────────────────────────────────
  // 1. TITLE TAG
  // ─────────────────────────────────────────
  const title = $("title").first().text().trim();
  results.data.title = title;

  check(results, {
    id: "title_exists",
    label: "Title tag exists",
    weight: 10,
    pass: !!title,
    failMsg: "Title tag missing hai!",
    passMsg: `Title: "${title}"`,
  });

  if (title) {
    check(results, {
      id: "title_length",
      label: "Title length (30-60 chars)",
      weight: 5,
      pass: title.length >= 30 && title.length <= 60,
      failMsg: `Title ${title.length} chars ka hai — ideal: 30-60 chars`,
      passMsg: `Title length sahi hai (${title.length} chars)`,
      isWarning: title.length > 0,
    });
  }

  // ─────────────────────────────────────────
  // 2. META DESCRIPTION
  // ─────────────────────────────────────────
  const metaDesc = $('meta[name="description"]').attr("content") || "";
  results.data.metaDescription = metaDesc.trim();

  check(results, {
    id: "meta_desc_exists",
    label: "Meta description exists",
    weight: 8,
    pass: !!metaDesc,
    failMsg: "Meta description missing hai!",
    passMsg: `Meta description: "${metaDesc.substring(0, 60)}..."`,
  });

  if (metaDesc) {
    check(results, {
      id: "meta_desc_length",
      label: "Meta description length (120-160 chars)",
      weight: 4,
      pass: metaDesc.length >= 120 && metaDesc.length <= 160,
      failMsg: `Meta description ${metaDesc.length} chars — ideal: 120-160`,
      passMsg: `Meta description length sahi (${metaDesc.length} chars)`,
      isWarning: true,
    });
  }

  // ─────────────────────────────────────────
  // 3. CANONICAL URL
  // ─────────────────────────────────────────
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  results.data.canonical = canonical;

  check(results, {
    id: "canonical",
    label: "Canonical URL set hai",
    weight: 6,
    pass: !!canonical,
    failMsg: "Canonical URL set nahi — duplicate content issue ho sakta hai",
    passMsg: `Canonical: ${canonical}`,
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 4. ROBOTS META
  // ─────────────────────────────────────────
  const robots = $('meta[name="robots"]').attr("content") || "";
  results.data.robots = robots;

  const isNoIndex =
    robots.toLowerCase().includes("noindex") ||
    robots.toLowerCase().includes("none");

  check(results, {
    id: "robots_noindex",
    label: "Page indexable hai",
    weight: 10,
    pass: !isNoIndex,
    failMsg: `robots meta "${robots}" — page index nahi hoga Google mein!`,
    passMsg: robots ? `Robots: ${robots}` : "Robots restriction nahi (indexable)",
  });

  // ─────────────────────────────────────────
  // 5. OPEN GRAPH TAGS
  // ─────────────────────────────────────────
  const og = {
    title: $('meta[property="og:title"]').attr("content") || "",
    description: $('meta[property="og:description"]').attr("content") || "",
    image: $('meta[property="og:image"]').attr("content") || "",
    url: $('meta[property="og:url"]').attr("content") || "",
    type: $('meta[property="og:type"]').attr("content") || "",
  };
  results.data.og = og;

  const ogCount = Object.values(og).filter(Boolean).length;

  check(results, {
    id: "og_tags",
    label: "Open Graph tags (social sharing)",
    weight: 6,
    pass: ogCount >= 3,
    failMsg:
      ogCount === 0
        ? "OG tags bilkul nahi — social media preview nahi banega!"
        : `Sirf ${ogCount}/5 OG tags hain (og:title, description, image zaroori)`,
    passMsg: `OG tags set hain (${ogCount}/5)`,
    isWarning: ogCount > 0 && ogCount < 3,
  });

  // ─────────────────────────────────────────
  // 6. TWITTER CARD
  // ─────────────────────────────────────────
  const twitterCard = $('meta[name="twitter:card"]').attr("content") || "";
  results.data.twitterCard = twitterCard;

  check(results, {
    id: "twitter_card",
    label: "Twitter Card set hai",
    weight: 3,
    pass: !!twitterCard,
    failMsg: "Twitter card meta missing — Twitter pe preview nahi banega",
    passMsg: `Twitter card: ${twitterCard}`,
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 7. HEADING STRUCTURE (H1)
  // ─────────────────────────────────────────
  const h1Tags = $("h1");
  const h1Count = h1Tags.length;
  const h1Text = h1Tags
    .map((i, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
  results.data.h1 = h1Text;
  results.data.headings = {
    h1: h1Count,
    h2: $("h2").length,
    h3: $("h3").length,
    h4: $("h4").length,
  };

  check(results, {
    id: "h1_exists",
    label: "H1 heading exists",
    weight: 8,
    pass: h1Count >= 1,
    failMsg: "H1 heading missing hai — page ka main topic unclear",
    passMsg: `H1: "${h1Text[0]?.substring(0, 50) || ""}"`,
  });

  check(results, {
    id: "h1_single",
    label: "Single H1 tag",
    weight: 4,
    pass: h1Count <= 1,
    failMsg: `${h1Count} H1 tags hain — sirf ek hona chahiye`,
    passMsg: "Ek hi H1 tag hai ✓",
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 8. IMAGES ALT TEXT
  // ─────────────────────────────────────────
  const allImages = $("img");
  const imagesWithoutAlt = $('img:not([alt]), img[alt=""]');
  const totalImages = allImages.length;
  const missingAlt = imagesWithoutAlt.length;
  results.data.images = { total: totalImages, missingAlt };

  if (totalImages > 0) {
    check(results, {
      id: "img_alt",
      label: "Images have alt text",
      weight: 6,
      pass: missingAlt === 0,
      failMsg: `${missingAlt}/${totalImages} images mein alt text missing`,
      passMsg: `Sab ${totalImages} images mein alt text hai ✓`,
      isWarning: true,
    });
  }

  // ─────────────────────────────────────────
  // 9. SCHEMA / STRUCTURED DATA
  // ─────────────────────────────────────────
  const schemaScripts = $('script[type="application/ld+json"]');
  const hasSchema = schemaScripts.length > 0;
  results.data.schema = { exists: hasSchema, count: schemaScripts.length };

  check(results, {
    id: "schema",
    label: "Structured data (Schema.org)",
    weight: 5,
    pass: hasSchema,
    failMsg: "Structured data nahi — rich snippets Google mein nahi aayenge",
    passMsg: `Schema.org structured data found (${schemaScripts.length} script)`,
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 10. VIEWPORT META (Mobile SEO)
  // ─────────────────────────────────────────
  const viewport = $('meta[name="viewport"]').attr("content") || "";
  results.data.viewport = viewport;

  check(results, {
    id: "viewport",
    label: "Viewport meta (mobile-friendly)",
    weight: 7,
    pass: !!viewport,
    failMsg: "Viewport meta missing — mobile SEO kharab hoga!",
    passMsg: `Viewport: ${viewport}`,
  });

  // ─────────────────────────────────────────
  // SCORE CALCULATE KARO
  // ─────────────────────────────────────────
  const percentage =
    results.maxScore > 0
      ? Math.round((results.score / results.maxScore) * 100)
      : 0;

  results.percentage = percentage;
  results.grade = getGrade(percentage);

  return results;
}

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────

function check(results, { id, label, weight, pass, failMsg, passMsg, isWarning }) {
  results.maxScore += weight;

  if (pass) {
    results.score += weight;
    results.passed.push({ id, label, msg: passMsg, weight });
  } else if (isWarning) {
    results.score += Math.floor(weight / 2); // warning pe half score
    results.warnings.push({ id, label, msg: failMsg, weight });
  } else {
    results.issues.push({ id, label, msg: failMsg, weight });
  }
}

function getGrade(percentage) {
  if (percentage >= 90) return { letter: "A", emoji: "🟢", label: "Excellent" };
  if (percentage >= 75) return { letter: "B", emoji: "🟡", label: "Good" };
  if (percentage >= 60) return { letter: "C", emoji: "🟠", label: "Average" };
  if (percentage >= 40) return { letter: "D", emoji: "🔴", label: "Poor" };
  return { letter: "F", emoji: "💀", label: "Very Poor" };
}

module.exports = { analyzeSEO };
