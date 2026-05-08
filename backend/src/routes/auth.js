import { Router } from 'express'
import passport from '../services/passport.js'
import jwt from 'jsonwebtoken'

export const authRouter = Router()

authRouter.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
)

authRouter.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, username: req.user.username, avatarUrl: req.user.avatar_url },
      process.env.SESSION_SECRET,
      { expiresIn: '7d' }
    )
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`)
  }
)

authRouter.get('/me', (req, res) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const user = jwt.verify(auth.split(' ')[1], process.env.SESSION_SECRET)
    res.json({ id: user.id, username: user.username, avatarUrl: user.avatarUrl })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

authRouter.post('/logout', (req, res) => {
  res.json({ success: true })
})