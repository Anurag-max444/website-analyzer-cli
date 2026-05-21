/**
 * Website Analyzer — Cloudflare Workers API
 * Entry point — routes all requests
 */

import { handleOptions, withCors } from "./middleware/cors.js";
import { notFound, serverError } from "./lib/response.js";
import { handleAnalyze } from "./routes/analyze.js";

// ─────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const path = url.pathname;

    // ── CORS preflight ──
    if (method === "OPTIONS") {
      return withCors(handleOptions(request), request);
    }

    try {
      let response;

      // ── Health check ──
      if (path === "/" || path === "/health") {
        response = new Response(
          JSON.stringify({
            success: true,
            service: "website-analyzer-api",
            version: env.API_VERSION || "v1",
            environment: env.ENVIRONMENT || "development",
            timestamp: new Date().toISOString(),
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );

      // ── POST /api/v1/analyze ──
      } else if (path === "/api/v1/analyze" && method === "POST") {
        response = await handleAnalyze(request, env, ctx);

      // ── 404 ──
      } else {
        response = notFound(`Route not found: ${method} ${path}`);
      }

      return withCors(response, request);

    } catch (error) {
      console.error("Worker error:", error);
      return withCors(serverError(error.message), request);
    }
  },
};
