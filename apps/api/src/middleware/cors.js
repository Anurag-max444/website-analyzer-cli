/**
 * CORS Middleware
 * Cloudflare Workers mein CORS headers handle karta hai
 */

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://website-analyzer.pages.dev",  // Cloudflare Pages
  // Production domain baad mein add karo
];

export function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";

  const allowed =
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith(".website-analyzer.pages.dev");

  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Max-Age": "86400",
  };
}

export function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export function withCors(response, request) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders(request)).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
