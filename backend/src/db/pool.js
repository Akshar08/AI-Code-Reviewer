import pg from 'pg'
import dotenv from 'dotenv'
 
dotenv.config()
 
const { Pool } = pg
 
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false // required for Supabase
})
 
// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message)
  } else {
    console.log('✅ Database connected')
    release()
  }
})
 