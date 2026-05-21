const { getGrade } = require('@website-analyzer/shared');
/**
 * Accessibility Analyzer
 * Checks: Alt text, ARIA labels, Heading hierarchy, Form labels,
 *         Keyboard navigation, Language, Skip links, Color hints
 */

const { t } = require("../utils/lang");

function analyzeAccessibility($) {
  const results = {
    score: 0,
    maxScore: 0,
    issues: [],
    warnings: [],
    passed: [],
    data: {},
  };

  // 1. LANGUAGE ATTRIBUTE
  const htmlLang = $("html").attr("lang") || "";
  results.data.lang = htmlLang;

  check(results, {
    label: "HTML lang attribute",
    weight: 8,
    pass: !!htmlLang,
    failMsg: t("accessibility.langMissing"),
    passMsg: t("accessibility.langOk")(htmlLang),
  });

  // 2. IMAGE ALT TEXT
  const allImgs = $("img");
  const totalImgs = allImgs.length;
  const missingAlt = [];

  allImgs.each((i, el) => {
    const alt = $(el).attr("alt");
    const src = $(el).attr("src") || "unknown";
    if (alt === undefined || alt === null) {
      missingAlt.push(src.substring(0, 50));
    }
  });

  results.data.images = { total: totalImgs, missingAlt: missingAlt.length };

  if (totalImgs > 0) {
    check(results, {
      label: "Images alt text",
      weight: 12,
      pass: missingAlt.length === 0,
      failMsg: t("accessibility.imgAltMissing")(missingAlt.length, totalImgs),
      passMsg: t("accessibility.imgAltOk")(totalImgs),
      isWarning: missingAlt.length <= 3,
    });
  }

  // 3. HEADING HIERARCHY
  const headings = [];
  $("h1, h2, h3, h4, h5, h6").each((i, el) => {
    headings.push({
      level: parseInt(el.tagName.replace("h", "")),
      text: $(el).text().trim().substring(0, 50),
    });
  });

  results.data.headings = {
    total: headings.length,
    structure: headings.slice(0, 10),
  };

  const h1Count = headings.filter((h) => h.level === 1).length;

  check(results, {
    label: "H1 heading exists",
    weight: 10,
    pass: h1Count >= 1,
    failMsg: t("accessibility.h1Missing"),
    passMsg: t("accessibility.h1Ok"),
  });

  check(results, {
    label: "Single H1 (not multiple)",
    weight: 6,
    pass: h1Count <= 1,
    failMsg: t("accessibility.h1Multiple")(h1Count),
    passMsg: t("accessibility.h1Single"),
    isWarning: true,
  });

  let headingSkip = false;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level - headings[i - 1].level > 1) {
      headingSkip = true;
      break;
    }
  }

  check(results, {
    label: "Heading hierarchy correct",
    weight: 7,
    pass: !headingSkip,
    failMsg: t("accessibility.headingSkip"),
    passMsg: t("accessibility.headingOk"),
    isWarning: true,
  });

  // 4. FORM ACCESSIBILITY
  const inputs = $("input:not([type='hidden']):not([type='submit']):not([type='button'])");
  const totalInputs = inputs.length;
  let unlabeledInputs = 0;

  inputs.each((i, el) => {
    const id = $(el).attr("id");
    const ariaLabel = $(el).attr("aria-label");
    const ariaLabelledBy = $(el).attr("aria-labelledby");
    const placeholder = $(el).attr("placeholder");
    const hasLabel = id && $(`label[for="${id}"]`).length > 0;

    if (!hasLabel && !ariaLabel && !ariaLabelledBy && !placeholder) {
      unlabeledInputs++;
    }
  });

  results.data.forms = { totalInputs, unlabeledInputs };

  if (totalInputs > 0) {
    check(results, {
      label: "Form inputs labeled",
      weight: 10,
      pass: unlabeledInputs === 0,
      failMsg: t("accessibility.inputsUnlabeled")(unlabeledInputs, totalInputs),
      passMsg: t("accessibility.inputsOk")(totalInputs),
      isWarning: unlabeledInputs <= 2,
    });
  }

  // 5. BUTTONS ACCESSIBLE
  const buttons = $("button, [role='button']");
  const totalButtons = buttons.length;
  let emptyButtons = 0;

  buttons.each((i, el) => {
    const text = $(el).text().trim();
    const ariaLabel = $(el).attr("aria-label") || "";
    const ariaLabelledBy = $(el).attr("aria-labelledby") || "";
    const title = $(el).attr("title") || "";
    if (!text && !ariaLabel && !ariaLabelledBy && !title) {
      emptyButtons++;
    }
  });

  results.data.buttons = { total: totalButtons, empty: emptyButtons };

  if (totalButtons > 0) {
    check(results, {
      label: "Buttons have accessible names",
      weight: 8,
      pass: emptyButtons === 0,
      failMsg: t("accessibility.emptyButtons")(emptyButtons),
      passMsg: t("accessibility.buttonsOk")(totalButtons),
      isWarning: emptyButtons <= 2,
    });
  }

  // 6. LINKS ACCESSIBLE
  const links = $("a[href]");
  const totalLinks = links.length;
  let emptyLinks = 0;
  let genericLinksCount = 0;
  const genericTexts = ["click here", "here", "read more", "more", "link", "this"];
  const foundGeneric = [];

  links.each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    const ariaLabel = $(el).attr("aria-label") || "";
    const title = $(el).attr("title") || "";

    if (!text && !ariaLabel && !title) {
      emptyLinks++;
    } else if (genericTexts.includes(text) && !ariaLabel) {
      genericLinksCount++;
      foundGeneric.push(`"${text}"`);
    }
  });

  results.data.links = { total: totalLinks, empty: emptyLinks, generic: genericLinksCount };

  if (totalLinks > 0) {
    check(results, {
      label: "Links have descriptive text",
      weight: 7,
      pass: emptyLinks === 0 && genericLinksCount <= 2,
      failMsg: [
        emptyLinks > 0 ? `${emptyLinks} empty links` : "",
        genericLinksCount > 2 ? t("accessibility.genericLinks")(foundGeneric.slice(0, 3)) : "",
      ].filter(Boolean).join(", "),
      passMsg: t("accessibility.linksOk"),
      isWarning: genericLinksCount > 0 && genericLinksCount <= 2,
    });
  }

  // 7. SKIP NAVIGATION
  const skipLink =
    $('a[href="#main"], a[href="#content"], a[href="#maincontent"]').length > 0 ||
    $("a:first").text().toLowerCase().includes("skip");
  results.data.skipLink = skipLink;

  check(results, {
    label: "Skip navigation link",
    weight: 5,
    pass: skipLink,
    failMsg: t("accessibility.skipNavMissing"),
    passMsg: t("accessibility.skipNavOk"),
    isWarning: true,
  });

  // 8. ARIA LANDMARKS
  const hasMain = $("main, [role='main']").length > 0;
  const hasNav = $("nav, [role='navigation']").length > 0;
  const hasHeader = $("header, [role='banner']").length > 0;
  const hasFooter = $("footer, [role='contentinfo']").length > 0;
  const landmarkCount = [hasMain, hasNav, hasHeader, hasFooter].filter(Boolean).length;

  results.data.landmarks = { main: hasMain, nav: hasNav, header: hasHeader, footer: hasFooter };

  check(results, {
    label: "ARIA landmarks (main, nav, header)",
    weight: 8,
    pass: landmarkCount >= 3,
    failMsg: landmarkCount === 0 ? t("accessibility.noLandmarks") : t("accessibility.fewLandmarks")(landmarkCount),
    passMsg: t("accessibility.landmarksOk")(landmarkCount),
    isWarning: landmarkCount >= 1 && landmarkCount < 3,
  });

  // 9. TABINDEX MISUSE
  const badTabindex = $("[tabindex]").filter((i, el) => {
    const val = parseInt($(el).attr("tabindex"));
    return val > 0;
  }).length;

  results.data.tabindex = { badUsage: badTabindex };

  check(results, {
    label: "tabindex not misused",
    weight: 5,
    pass: badTabindex === 0,
    failMsg: t("accessibility.badTabindex")(badTabindex),
    passMsg: t("accessibility.tabindexOk"),
    isWarning: true,
  });

  // 10. VIEWPORT ZOOM
  const viewport = $('meta[name="viewport"]').attr("content") || "";
  const zoomDisabled =
    /user-scalable\s*=\s*no/i.test(viewport) ||
    /maximum-scale\s*=\s*1/i.test(viewport);
  results.data.zoomDisabled = zoomDisabled;

  check(results, {
    label: "Zoom not disabled",
    weight: 8,
    pass: !zoomDisabled,
    failMsg: t("accessibility.zoomDisabled"),
    passMsg: t("accessibility.zoomOk"),
  });

  const percentage =
    results.maxScore > 0
      ? Math.round((results.score / results.maxScore) * 100)
      : 0;

  results.percentage = percentage;
  results.grade = getGrade(percentage);

  return results;
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



module.exports = { analyzeAccessibility };
