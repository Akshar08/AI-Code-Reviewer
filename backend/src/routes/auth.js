import { Router } from 'express'
import passport from '../services/passport.js'
 
export const authRouter = Router()
 
// Kick off GitHub OAuth
authRouter.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
)
 
// GitHub redirects back here after login
authRouter.get('/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:5173/login?error=auth_failed' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard')
  }
)
 
// Get current logged-in user
authRouter.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
  res.json({
    id: req.user.id,
    username: req.user.username,
    avatarUrl: req.user.avatar_url,
  })
})
 
// Logout
authRouter.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err)
    res.json({ success: true })
  })
})