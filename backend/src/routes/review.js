import { Router } from 'express'
import { reviewCode } from '../services/reviewService.js'
import { validateReviewRequest } from '../middleware/validateRequest.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { saveReview, getReviewsByUser, getReviewById } from '../db/queries.js'
 
export const reviewRouter = Router()
 
// POST /api/review — run a review and save it
reviewRouter.post('/', requireAuth, validateReviewRequest, async (req, res, next) => {
  try {
    const { code, language } = req.body
    const aiResult = await reviewCode(code, language)
 
    const saved = await saveReview(req.user.id, {
      language: aiResult.language,
      code,
      score: aiResult.score,
      summary: aiResult.summary,
      bugs: aiResult.bugs,
      improvements: aiResult.improvements,
      positives: aiResult.positives,
      tokensUsed: aiResult.tokensUsed,
    })
 
    res.json({ success: true, data: { ...aiResult, id: saved.id } })
  } catch (err) {
    next(err)
  }
})
 
// GET /api/review/history — get current user's review history
reviewRouter.get('/history', requireAuth, async (req, res, next) => {
  try {
    const reviews = await getReviewsByUser(req.user.id)
    res.json({ success: true, data: reviews })
  } catch (err) {
    next(err)
  }
})
 
// GET /api/review/:id — get a single review
reviewRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const review = await getReviewById(req.params.id, req.user.id)
    if (!review) return res.status(404).json({ error: 'Review not found' })
    res.json({ success: true, data: review })
  } catch (err) {
    next(err)
  }
})