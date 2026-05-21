const axios = require("axios");
const cheerio = require("cheerio");
const { t } = require("./lang");

/**
 * Fetches a URL and returns HTML + metadata
 * @param {string} url - The URL to fetch
 * @returns {object} - { html, $, statusCode, headers, responseTime, finalUrl }
 */
async function fetchUrl(url) {
  // Auto-add https:// if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  const startTime = Date.now();

  try {
    const response = await axios.get(url, {
      timeout: 15000, // 15 seconds
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; WebsiteAnalyzerCLI/1.0; +https://github.com/website-analyzer)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
      },
      validateStatus: (status) => status < 600, // allow 5xx responses too
    });

    const responseTime = Date.now() - startTime;
    const html = response.data;
    const $ = cheerio.load(html);

    return {
      success: true,
      url: url,
      finalUrl: response.request?.res?.responseUrl || url,
      html: html,
      $: $,
      statusCode: response.status,
      headers: response.headers,
      responseTime: responseTime,
      contentLength: html.length,
      contentType: response.headers["content-type"] || "unknown",
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Handle error types
    if (error.code === "ENOTFOUND") {
      throw new Error(`❌ ${t("fetcher.notFound")(url)}`);
    } else if (error.code === "ECONNREFUSED") {
      throw new Error(`❌ ${t("fetcher.connRefused")}`);
    } else if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      throw new Error(`❌ ${t("fetcher.timeout")(responseTime)}`);
    } else if (error.response) {
      // Server ne error response diya
      return {
        success: false,
        url: url,
        finalUrl: url,
        html: error.response.data || "",
        $: cheerio.load(error.response.data || ""),
        statusCode: error.response.status,
        headers: error.response.headers,
        responseTime: responseTime,
        contentLength: 0,
        contentType: "unknown",
        error: `HTTP ${error.response.status}`,
      };
    } else {
      throw new Error(`❌ ${t("fetcher.fetchError")(error.message)}`);
    }
  }
}

/**
 * Check if URL is valid
 */
function isValidUrl(url) {
  try {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * URL ko clean/normalize karo
 * @param {string} url
 * @returns {string}
 */
function normalizeUrl(url) {
  url = url.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  // Remove trailing slash (for homepages)
  try {
    const parsed = new URL(url);
    if (parsed.pathname === "/") {
      return url.replace(/\/$/, "") || url;
    }
  } catch {}
  return url;
}

module.exports = { fetchUrl, isValidUrl, normalizeUrl };
