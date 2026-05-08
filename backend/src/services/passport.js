import passport from 'passport'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { findOrCreateUser } from '../db/queries.js'
import dotenv from 'dotenv'
 
dotenv.config()
 
passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'https://ai-code-reviewer-production-bb2e.up.railway.app/auth/github/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser({
        githubId: profile.id,
        username: profile.username,
        avatarUrl: profile.photos?.[0]?.value || null,
      })
      return done(null, user)
    } catch (err) {
      return done(err)
    }
  }
))
 
// Store user id in session
passport.serializeUser((user, done) => done(null, user.id))
 
// Retrieve full user from session
passport.deserializeUser(async (id, done) => {
  try {
    const { pool } = await import('../db/pool.js')
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    done(null, result.rows[0] || null)
  } catch (err) {
    done(err)
  }
})
 
export default passport