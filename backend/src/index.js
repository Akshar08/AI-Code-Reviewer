import express from 'express'
import cors from 'cors'
import session from 'express-session'
import dotenv from 'dotenv'
import passport from './services/passport.js'
import { reviewRouter } from './routes/review.js'
import { authRouter } from './routes/auth.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
 
dotenv.config()
 
const app = express()
const PORT = process.env.PORT || 3001
 
// CORS — must allow credentials for sessions
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.set('trust proxy', 1)
app.use(express.json({ limit: '50kb' }))
 
// Sessions (needed for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: true,
  saveUninitialized: true,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}))
 
// Passport auth
app.use(passport.initialize())
app.use(passport.session())
 
app.use(rateLimiter)
 
// Routes
app.get('/health', (req, res) => res.json({ status: 'ok', user: req.user?.username || null }))
app.use('/auth', authRouter)
app.use('/api/review', reviewRouter)
 
app.use(errorHandler)
 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})