const { getGrade } = require('@website-analyzer/shared');
/**
 * SEO Analyzer
 * Checks: Title, Meta Description, OG Tags, Twitter Cards,
 *         Canonical, Robots, Headings, Images alt text, Schema
 */

const { t } = require("../utils/lang");

function analyzeSEO($, url) {
  const results = {
    score: 0,
    maxScore: 0,
    issues: [],
    warnings: [],
    passed: [],
    data: {},
  };

  // 1. TITLE TAG
  const title = $("title").first().text().trim();
  results.data.title = title;

  check(results, {
    id: "title_exists",
    label: "Title tag exists",
    weight: 10,
    pass: !!title,
    failMsg: t("seo.titleMissing"),
    passMsg: t("seo.titleOk")(title),
  });

  if (title) {
    check(results, {
      id: "title_length",
      label: "Title length (30-60 chars)",
      weight: 5,
      pass: title.length >= 30 && title.length <= 60,
      failMsg: t("seo.titleTooShort")(title.length),
      passMsg: t("seo.titleLengthOk")(title.length),
      isWarning: title.length > 0,
    });
  }

  // 2. META DESCRIPTION
  const metaDesc = $('meta[name="description"]').attr("content") || "";
  results.data.metaDescription = metaDesc.trim();

  check(results, {
    id: "meta_desc_exists",
    label: "Meta description exists",
    weight: 8,
    pass: !!metaDesc,
    failMsg: t("seo.metaMissing"),
    passMsg: t("seo.metaOk")(metaDesc.substring(0, 60)),
  });

  if (metaDesc) {
    check(results, {
      id: "meta_desc_length",
      label: "Meta description length (120-160 chars)",
      weight: 4,
      pass: metaDesc.length >= 120 && metaDesc.length <= 160,
      failMsg: t("seo.metaLength")(metaDesc.length),
      passMsg: t("seo.metaLengthOk")(metaDesc.length),
      isWarning: true,
    });
  }

  // 3. CANONICAL URL
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  results.data.canonical = canonical;

  check(results, {
    id: "canonical",
    label: "Canonical URL",
    weight: 6,
    pass: !!canonical,
    failMsg: t("seo.canonicalMissing"),
    passMsg: t("seo.canonicalOk")(canonical),
    isWarning: true,
  });

  // 4. ROBOTS META
  const robots = $('meta[name="robots"]').attr("content") || "";
  results.data.robots = robots;

  const isNoIndex =
    robots.toLowerCase().includes("noindex") ||
    robots.toLowerCase().includes("none");

  check(results, {
    id: "robots_noindex",
    label: "Page is indexable",
    weight: 10,
    pass: !isNoIndex,
    failMsg: t("seo.robotsBlocked")(robots),
    passMsg: t("seo.robotsOk")(robots),
  });

  // 5. OPEN GRAPH TAGS
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
    failMsg: ogCount === 0 ? t("seo.ogMissing") : t("seo.ogPartial")(ogCount),
    passMsg: t("seo.ogOk")(ogCount),
    isWarning: ogCount > 0 && ogCount < 3,
  });

  // 6. TWITTER CARD
  const twitterCard = $('meta[name="twitter:card"]').attr("content") || "";
  results.data.twitterCard = twitterCard;

  check(results, {
    id: "twitter_card",
    label: "Twitter Card",
    weight: 3,
    pass: !!twitterCard,
    failMsg: t("seo.twitterMissing"),
    passMsg: t("seo.twitterOk")(twitterCard),
    isWarning: true,
  });

  // 7. HEADING STRUCTURE (H1)
  const h1Tags = $("h1");
  const h1Count = h1Tags.length;
  const h1Text = h1Tags.map((i, el) => $(el).text().trim()).get().filter(Boolean);
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
    failMsg: t("seo.h1Missing"),
    passMsg: t("seo.h1Ok")(h1Text[0]?.substring(0, 50) || ""),
  });

  check(results, {
    id: "h1_single",
    label: "Single H1 tag",
    weight: 4,
    pass: h1Count <= 1,
    failMsg: t("seo.h1Multiple")(h1Count),
    passMsg: t("seo.h1Single"),
    isWarning: true,
  });

  // 8. IMAGES ALT TEXT
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
      failMsg: t("seo.imgAltMissing")(missingAlt, totalImages),
      passMsg: t("seo.imgAltOk")(totalImages),
      isWarning: true,
    });
  }

  // 9. SCHEMA / STRUCTURED DATA
  const schemaScripts = $('script[type="application/ld+json"]');
  const hasSchema = schemaScripts.length > 0;
  results.data.schema = { exists: hasSchema, count: schemaScripts.length };

  check(results, {
    id: "schema",
    label: "Structured data (Schema.org)",
    weight: 5,
    pass: hasSchema,
    failMsg: t("seo.schemaMissing"),
    passMsg: t("seo.schemaOk")(schemaScripts.length),
    isWarning: true,
  });

  // 10. VIEWPORT META
  const viewport = $('meta[name="viewport"]').attr("content") || "";
  results.data.viewport = viewport;

  check(results, {
    id: "viewport",
    label: "Viewport meta (mobile-friendly)",
    weight: 7,
    pass: !!viewport,
    failMsg: t("seo.viewportMissing"),
    passMsg: t("seo.viewportOk")(viewport),
  });

  const percentage =
    results.maxScore > 0
      ? Math.round((results.score / results.maxScore) * 100)
      : 0;

  results.percentage = percentage;
  results.grade = getGrade(percentage);

  return results;
}

function check(results, { id, label, weight, pass, failMsg, passMsg, isWarning }) {
  results.maxScore += weight;

  if (pass) {
    results.score += weight;
    results.passed.push({ id, label, msg: passMsg, weight });
  } else if (isWarning) {
    results.score += Math.floor(weight / 2);
    results.warnings.push({ id, label, msg: failMsg, weight });
  } else {
    results.issues.push({ id, label, msg: failMsg, weight });
  }
}



module.exports = { analyzeSEO };
