/**
 * URL + Input validation helpers
 * Workers compatible — no Node.js dependencies
 */

export function validateUrl(url) {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required", code: "MISSING_URL" };
  }

  url = url.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  if (url.length > 2048) {
    return { valid: false, error: "URL too long (max 2048 chars)", code: "URL_TOO_LONG" };
  }

  try {
    const parsed = new URL(url);
    // Private IPs block karo
    if (isPrivateHost(parsed.hostname)) {
      return { valid: false, error: "Private/local URLs not allowed", code: "PRIVATE_URL" };
    }
    return { valid: true, url };
  } catch {
    return { valid: false, error: `Invalid URL: ${url}`, code: "INVALID_URL" };
  }
}

function isPrivateHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.16.") ||
    hostname.endsWith(".local")
  );
}
