import type { AnalyzeRequest, ScanResult, ApiError } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

// ─────────────────────────────────────────
// Core fetch wrapper
// ─────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      (data as ApiError).error?.message || `HTTP ${response.status}`
    );
  }

  return data as T;
}

// ─────────────────────────────────────────
// Analyze endpoint
// ─────────────────────────────────────────

export async function analyzeSite(
  request: AnalyzeRequest
): Promise<ScanResult> {
  return apiFetch<ScanResult>("/api/v1/analyze", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// ─────────────────────────────────────────
// Health check
// ─────────────────────────────────────────

export async function checkHealth(): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/health");
}
