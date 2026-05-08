import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'You must be logged in.' })
  try {
    req.user = jwt.verify(auth.split(' ')[1], process.env.SESSION_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}