/**
 * Credits System helpers
 */

export async function checkCredits(db, userId) {
  try {
    const user = await db
      .prepare("SELECT credits FROM users WHERE id = ?")
      .bind(userId)
      .first();
    return user?.credits || 0;
  } catch {
    return 0;
  }
}

export async function deductCredits(db, userId, amount = 1, scanId = null) {
  try {
    await db
      .prepare("UPDATE users SET credits = credits - ? WHERE id = ? AND credits >= ?")
      .bind(amount, userId, amount)
      .run();

    // Transaction log
    await db
      .prepare(`
        INSERT INTO credit_transactions (id, user_id, amount, type, scan_id, created_at)
        VALUES (?, ?, ?, 'scan', ?, datetime('now'))
      `)
      .bind(crypto.randomUUID(), userId, -amount, scanId)
      .run();

    return true;
  } catch {
    return false;
  }
}

export async function addCredits(db, userId, amount, type = "gift", description = "") {
  try {
    await db
      .prepare("UPDATE users SET credits = credits + ? WHERE id = ?")
      .bind(amount, userId)
      .run();

    await db
      .prepare(`
        INSERT INTO credit_transactions (id, user_id, amount, type, description, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `)
      .bind(crypto.randomUUID(), userId, amount, type, description)
      .run();

    return true;
  } catch {
    return false;
  }
}
