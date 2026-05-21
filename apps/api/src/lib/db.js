/**
 * D1 Database helpers
 * Workers compatible
 */

export async function saveAnonymousScan(db, { url, result, clientIp }) {
  try {
    const id = crypto.randomUUID();
    const summary = result?.summary?.overall || {};

    await db
      .prepare(`
        INSERT INTO scans (
          id, url, status,
          score_overall, score_seo, score_performance,
          score_security, score_accessibility,
          result, created_at
        ) VALUES (?, ?, 'done', ?, ?, ?, ?, ?, ?, datetime('now'))
      `)
      .bind(
        id,
        url,
        summary.percentage || 0,
        result?.modules?.seo?.percentage || 0,
        result?.modules?.performance?.percentage || 0,
        result?.modules?.security?.percentage || 0,
        result?.modules?.accessibility?.percentage || 0,
        JSON.stringify(result)
      )
      .run();

    return id;
  } catch (error) {
    console.error("DB save error:", error);
    return null;
  }
}

export async function getUserByApiKey(db, apiKey) {
  try {
    return await db
      .prepare("SELECT * FROM users WHERE api_key = ? LIMIT 1")
      .bind(apiKey)
      .first();
  } catch {
    return null;
  }
}

export async function getUserById(db, userId) {
  try {
    return await db
      .prepare("SELECT * FROM users WHERE id = ? LIMIT 1")
      .bind(userId)
      .first();
  } catch {
    return null;
  }
}

export async function getRecentScans(db, userId, limit = 10) {
  try {
    return await db
      .prepare(`
        SELECT id, url, score_overall, status, created_at
        FROM scans WHERE user_id = ?
        ORDER BY created_at DESC LIMIT ?
      `)
      .bind(userId, limit)
      .all();
  } catch {
    return { results: [] };
  }
}
