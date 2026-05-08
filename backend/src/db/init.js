import { pool } from './pool.js'
 
async function initDB() {
  console.log('Initializing database tables...')
 
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      github_id   VARCHAR(255) UNIQUE NOT NULL,
      username    VARCHAR(255) NOT NULL,
      avatar_url  TEXT,
      created_at  TIMESTAMP DEFAULT NOW()
    );
  `)
 
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
      language     VARCHAR(50),
      code         TEXT NOT NULL,
      score        INTEGER,
      summary      TEXT,
      bugs         JSONB DEFAULT '[]',
      improvements JSONB DEFAULT '[]',
      positives    JSONB DEFAULT '[]',
      tokens_used  INTEGER DEFAULT 0,
      created_at   TIMESTAMP DEFAULT NOW()
    );
  `)
 
  console.log('✅ Tables created: users, reviews')
  await pool.end()
}
 
initDB().catch(err => {
  console.error('❌ Init failed:', err.message)
  process.exit(1)
})
 