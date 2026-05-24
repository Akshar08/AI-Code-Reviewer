import { pool } from './pool.js'
 
// ── Users ──────────────────────────────────────────────
export async function findOrCreateUser({ githubId, username, avatarUrl }) {
  const existing = await pool.query(
    'SELECT * FROM users WHERE github_id = $1',
    [githubId]
  )
  if (existing.rows.length > 0) return existing.rows[0]
 
  const created = await pool.query(
    'INSERT INTO users (github_id, username, avatar_url) VALUES ($1, $2, $3) RETURNING *',
    [githubId, username, avatarUrl]
  )
  return created.rows[0]
}
 
// ── Reviews ────────────────────────────────────────────
export async function saveReview(userId, { language, code, score, summary, bugs, improvements, positives, tokensUsed }) {
  const result = await pool.query(
    `INSERT INTO reviews (user_id, language, code, score, summary, bugs, improvements, positives, tokens_used)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [userId, language, code, score, summary,
     JSON.stringify(bugs), JSON.stringify(improvements), JSON.stringify(positives), tokensUsed]
  )
  return result.rows[0]
}
 
export async function getReviewsByUser(userId, limit = 20) {
  const result = await pool.query(
    `SELECT id, language, score, summary, created_at,
            LEFT(code, 120) AS code_preview
     FROM reviews WHERE user_id = $1
     ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  )
  return result.rows
}
 
export async function getReviewById(reviewId, userId) {
  const result = await pool.query(
    'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
    [reviewId, userId]
  )
  return result.rows[0] || null
}

export async function saveChatMessage(reviewId, userId, role, content) {
  const result = await pool.query(
    `INSERT INTO chat_messages (review_id, user_id, role, content)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [reviewId, userId, role, content]
  )
  return result.rows[0]
}
 
export async function getChatHistory(reviewId, userId) {
  const result = await pool.query(
    `SELECT role, content, created_at
     FROM chat_messages
     WHERE review_id = $1 AND user_id = $2
     ORDER BY created_at ASC`,
    [reviewId, userId]
  )
  return result.rows
}

export async function findExactCodeMatch(userId, code) {
  const result = await pool.query(
    `SELECT id, language, score, summary, created_at
     FROM reviews
     WHERE user_id = $1 AND code = $2
     ORDER BY created_at DESC LIMIT 1`,
    [userId, code]
  )
  return result.rows[0] || null
}
 
export async function deleteReview(reviewId, userId) {
  await pool.query(
    'DELETE FROM reviews WHERE id = $1 AND user_id = $2',
    [reviewId, userId]
  )
}
 