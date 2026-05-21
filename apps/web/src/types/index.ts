// ─────────────────────────────────────────
// Grade Types
// ─────────────────────────────────────────

export type GradeLetter = "A" | "B" | "C" | "D" | "F";

export interface Grade {
  letter: GradeLetter;
  emoji: string;
  label: string;
}

// ─────────────────────────────────────────
// Module Types
// ─────────────────────────────────────────

export type ModuleName =
  | "seo" | "performance" | "security"
  | "accessibility" | "links" | "sitemap"
  | "robots" | "schema";

export interface ModuleItem {
  label: string;
  message: string;
  weight: number;
}

export interface ModuleResult {
  score: number;
  maxScore: number;
  percentage: number;
  grade: Grade;
  issues: ModuleItem[];
  warnings: ModuleItem[];
  passed: ModuleItem[];
  data?: Record<string, unknown>;
}

// ─────────────────────────────────────────
// Scan Response
// ─────────────────────────────────────────

export interface TechItem {
  name: string;
  category: string;
  icon: string;
}

export interface TechStack {
  count: number;
  detected: TechItem[];
  grouped: Record<string, TechItem[]>;
}

export interface ScanSummary {
  overall: {
    score: number;
    maxScore: number;
    percentage: number;
    grade: Grade;
  };
  totalIssues: number;
  totalWarnings: number;
  totalPassed: number;
  modulesScanned: number;
  weakest?: ModuleName;
  strongest?: ModuleName;
}

export interface ScanMeta {
  url: string;
  scannedAt: string;
  responseTime: number;
  lang: string;
  version: string;
}

export interface ScanResult {
  success: boolean;
  requestId: string;
  meta: ScanMeta;
  summary: ScanSummary;
  modules: Partial<Record<ModuleName, ModuleResult>>;
  techStack: TechStack;
}

// ─────────────────────────────────────────
// API Types
// ─────────────────────────────────────────

export interface AnalyzeRequest {
  url: string;
  modules?: ModuleName[];
  lang?: "en" | "hi";
  noLinks?: boolean;
  compact?: boolean;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    status: number;
  };
}

// ─────────────────────────────────────────
// UI State Types
// ─────────────────────────────────────────

export type ScanStatus = "idle" | "loading" | "success" | "error";

export interface ScanState {
  status: ScanStatus;
  result: ScanResult | null;
  error: string | null;
}
