-- ─────────────────────────────────────────
-- Website Analyzer — D1 Database Schema
-- Run: npm run db:migrate
-- ─────────────────────────────────────────

-- ── Users ────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,          -- UUID
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  credits     INTEGER DEFAULT 20,        -- Free beta credits
  api_key     TEXT UNIQUE,               -- API key
  plan        TEXT DEFAULT 'free',       -- free | pro | enterprise
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- ── Scans ─────────────────────────────────
CREATE TABLE IF NOT EXISTS scans (
  id            TEXT PRIMARY KEY,        -- UUID
  user_id       TEXT,                    -- NULL = anonymous
  url           TEXT NOT NULL,
  status        TEXT DEFAULT 'pending',  -- pending | running | done | failed
  credits_used  INTEGER DEFAULT 1,

  -- Scores (quick access)
  score_overall     INTEGER,
  score_seo         INTEGER,
  score_performance INTEGER,
  score_security    INTEGER,
  score_accessibility INTEGER,
  score_links       INTEGER,
  score_sitemap     INTEGER,
  score_robots      INTEGER,
  score_schema      INTEGER,

  -- Full result JSON
  result        TEXT,                    -- JSON stringified
  error         TEXT,                    -- Error message if failed

  created_at    TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── Notifications ─────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  type        TEXT NOT NULL,             -- scan_complete | credits_low | new_feature | maintenance | broadcast
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     INTEGER DEFAULT 0,         -- 0 = unread, 1 = read
  meta        TEXT,                      -- JSON (extra data like scan_id, url etc.)
  created_at  TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── API Keys ──────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  key         TEXT UNIQUE NOT NULL,
  name        TEXT DEFAULT 'Default',    -- Key label
  last_used   TEXT,
  is_active   INTEGER DEFAULT 1,
  created_at  TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── Credit Transactions ───────────────────
CREATE TABLE IF NOT EXISTS credit_transactions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  amount      INTEGER NOT NULL,          -- Positive = add, Negative = deduct
  type        TEXT NOT NULL,             -- scan | gift | refund | purchase
  description TEXT,
  scan_id     TEXT,                      -- Reference to scan if type=scan
  created_at  TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── Indexes ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_scans_user_id    ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_url        ON scans(url);
CREATE INDEX IF NOT EXISTS idx_scans_created    ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifs_user_id   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifs_unread    ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_api_keys_key     ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_credit_user      ON credit_transactions(user_id);
