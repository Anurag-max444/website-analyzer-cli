const { getGrade } = require('@website-analyzer/shared');
/**
 * Schema / Structured Data Analyzer
 * Checks: JSON-LD, Microdata, RDFa
 * Types: Organization, WebSite, Product, Article, BreadcrumbList,
 *        FAQPage, LocalBusiness, Person, Review, Event, etc.
 */

const { t } = require("../utils/lang");

// ─────────────────────────────────────────
// HIGH VALUE SCHEMA TYPES
// ─────────────────────────────────────────

const HIGH_VALUE_TYPES = [
  "Organization", "WebSite", "WebPage", "Product", "Article",
  "BlogPosting", "NewsArticle", "BreadcrumbList", "FAQPage",
  "LocalBusiness", "Person", "Review", "AggregateRating",
  "Event", "Recipe", "HowTo", "VideoObject", "ImageObject",
  "SoftwareApplication", "Course", "JobPosting",
];

const RICH_RESULT_TYPES = [
  "FAQPage", "HowTo", "Recipe", "Product", "Review",
  "AggregateRating", "Event", "JobPosting", "Course",
  "SoftwareApplication", "VideoObject", "BreadcrumbList",
];

// ─────────────────────────────────────────
// MAIN ANALYZER
// ─────────────────────────────────────────

function analyzeSchema($) {
  const results = {
    score: 0,
    maxScore: 0,
    issues: [],
    warnings: [],
    passed: [],
    data: {
      jsonLd: [],          // parsed JSON-LD blocks
      microdata: [],       // microdata types found
      rdfa: [],            // RDFa types found
      types: [],           // all detected @types
      richResultTypes: [], // types eligible for rich results
      hasOrganization: false,
      hasWebSite: false,
      hasBreadcrumb: false,
      hasProduct: false,
      totalSchemas: 0,
      errors: [],          // parse errors
    },
  };

  // ─────────────────────────────────────────
  // 1. JSON-LD PARSE KARO
  // ─────────────────────────────────────────
  const jsonLdBlocks = [];

  $('script[type="application/ld+json"]').each((i, el) => {
    const raw = $(el).html() || "";
    try {
      const parsed = JSON.parse(raw.trim());
      // Array ya single object dono handle karo
      const items = Array.isArray(parsed) ? parsed : [parsed];
      items.forEach(item => jsonLdBlocks.push(item));
    } catch (e) {
      results.data.errors.push(`JSON-LD block ${i + 1}: Parse error — ${e.message}`);
    }
  });

  results.data.jsonLd = jsonLdBlocks;

  // Types extract karo (nested bhi)
  const allTypes = [];
  jsonLdBlocks.forEach(block => {
    extractTypes(block, allTypes);
  });

  // ─────────────────────────────────────────
  // 2. MICRODATA CHECK KARO
  // ─────────────────────────────────────────
  const microdataTypes = [];
  $("[itemtype]").each((i, el) => {
    const itemtype = $(el).attr("itemtype") || "";
    const type = itemtype.split("/").pop();
    if (type) microdataTypes.push(type);
  });
  results.data.microdata = microdataTypes;
  allTypes.push(...microdataTypes);

  // ─────────────────────────────────────────
  // 3. RDFA CHECK KARO
  // ─────────────────────────────────────────
  const rdfaTypes = [];
  $("[typeof]").each((i, el) => {
    const type = $(el).attr("typeof") || "";
    if (type) rdfaTypes.push(type);
  });
  results.data.rdfa = rdfaTypes;
  allTypes.push(...rdfaTypes);

  // Deduplicate types
  results.data.types = [...new Set(allTypes)];
  results.data.totalSchemas = jsonLdBlocks.length + microdataTypes.length + rdfaTypes.length;

  // Rich result types
  results.data.richResultTypes = results.data.types.filter(t =>
    RICH_RESULT_TYPES.includes(t)
  );

  // Key types check
  results.data.hasOrganization = results.data.types.includes("Organization");
  results.data.hasWebSite = results.data.types.includes("WebSite");
  results.data.hasBreadcrumb = results.data.types.includes("BreadcrumbList");
  results.data.hasProduct = results.data.types.includes("Product");

  // ─────────────────────────────────────────
  // 4. SCHEMA EXISTS CHECK
  // ─────────────────────────────────────────
  check(results, {
    label: "Schema markup exists",
    weight: 20,
    pass: results.data.totalSchemas > 0,
    failMsg: t("schema.notFound"),
    passMsg: t("schema.found")(results.data.totalSchemas),
  });

  if (results.data.totalSchemas === 0) {
    results.percentage = 0;
    results.grade = getGrade(0);
    return results;
  }

  // ─────────────────────────────────────────
  // 5. JSON-LD PREFERRED FORMAT
  // ─────────────────────────────────────────
  check(results, {
    label: "Uses JSON-LD (Google recommended)",
    weight: 12,
    pass: jsonLdBlocks.length > 0,
    failMsg: t("schema.noJsonLd"),
    passMsg: t("schema.hasJsonLd")(jsonLdBlocks.length),
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 6. PARSE ERRORS
  // ─────────────────────────────────────────
  check(results, {
    label: "No JSON-LD parse errors",
    weight: 15,
    pass: results.data.errors.length === 0,
    failMsg: t("schema.parseErrors")(results.data.errors.length),
    passMsg: t("schema.noErrors"),
  });

  // ─────────────────────────────────────────
  // 7. ORGANIZATION SCHEMA
  // ─────────────────────────────────────────
  check(results, {
    label: "Organization schema",
    weight: 10,
    pass: results.data.hasOrganization,
    failMsg: t("schema.noOrganization"),
    passMsg: t("schema.hasOrganization"),
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 8. WEBSITE SCHEMA
  // ─────────────────────────────────────────
  check(results, {
    label: "WebSite schema",
    weight: 8,
    pass: results.data.hasWebSite,
    failMsg: t("schema.noWebSite"),
    passMsg: t("schema.hasWebSite"),
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 9. RICH RESULT ELIGIBLE TYPES
  // ─────────────────────────────────────────
  check(results, {
    label: "Rich result eligible schema",
    weight: 15,
    pass: results.data.richResultTypes.length > 0,
    failMsg: t("schema.noRichResults"),
    passMsg: t("schema.hasRichResults")(results.data.richResultTypes.join(", ")),
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 10. BREADCRUMB SCHEMA
  // ─────────────────────────────────────────
  check(results, {
    label: "BreadcrumbList schema",
    weight: 8,
    pass: results.data.hasBreadcrumb,
    failMsg: t("schema.noBreadcrumb"),
    passMsg: t("schema.hasBreadcrumb"),
    isWarning: true,
  });

  // ─────────────────────────────────────────
  // 11. REQUIRED FIELDS CHECK (Organization)
  // ─────────────────────────────────────────
  if (results.data.hasOrganization) {
    const orgBlock = jsonLdBlocks.find(b =>
      b["@type"] === "Organization" ||
      (Array.isArray(b["@type"]) && b["@type"].includes("Organization"))
    );

    if (orgBlock) {
      const hasName = !!orgBlock.name;
      const hasUrl = !!orgBlock.url;
      const hasLogo = !!(orgBlock.logo);

      check(results, {
        label: "Organization has required fields",
        weight: 12,
        pass: hasName && hasUrl,
        failMsg: t("schema.orgMissingFields")(
          [!hasName && "name", !hasUrl && "url", !hasLogo && "logo"].filter(Boolean).join(", ")
        ),
        passMsg: t("schema.orgComplete"),
        isWarning: true,
      });
    }
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

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function extractTypes(obj, types) {
  if (!obj || typeof obj !== "object") return;

  if (obj["@type"]) {
    const type = obj["@type"];
    if (Array.isArray(type)) {
      types.push(...type);
    } else {
      types.push(type);
    }
  }

  // Nested objects mein bhi dhundo (@graph, mainEntity, etc.)
  const nestedKeys = ["@graph", "mainEntity", "publisher", "author", "breadcrumb", "review"];
  nestedKeys.forEach(key => {
    if (obj[key]) {
      if (Array.isArray(obj[key])) {
        obj[key].forEach(item => extractTypes(item, types));
      } else {
        extractTypes(obj[key], types);
      }
    }
  });
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



module.exports = { analyzeSchema };
