/**
 * Response helpers — clean JSON responses for Workers
 */

export function ok(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function err(message, status = 400, code = "BAD_REQUEST") {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message, code, status },
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export function notFound(message = "Not found") {
  return err(message, 404, "NOT_FOUND");
}

export function unauthorized(message = "Unauthorized") {
  return err(message, 401, "UNAUTHORIZED");
}

export function tooManyRequests(message = "Rate limit exceeded") {
  return err(message, 429, "RATE_LIMIT_EXCEEDED");
}

export function serverError(message = "Internal server error") {
  return err(message, 500, "INTERNAL_ERROR");
}
