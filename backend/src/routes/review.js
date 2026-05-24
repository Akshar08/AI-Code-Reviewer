import { Router } from 'express'
import { reviewCode } from '../services/reviewService.js'
import { validateReviewRequest } from '../middleware/validateRequest.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { saveReview, getReviewsByUser, getReviewById, deleteReview, findExactCodeMatch } from '../db/queries.js'

export const reviewRouter = Router()

// POST /api/review — run a review (with duplicate detection)
reviewRouter.post('/', requireAuth, validateReviewRequest, async (req, res, next) => {
  try {
    const { code, language } = req.body

    // Check for exact code match in user's history
    const existing = await findExactCodeMatch(req.user.id, code)
    if (existing) {
      return res.json({
        success: true,
        duplicate: true,
        data: existing,
      })
    }

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

    res.json({ success: true, duplicate: false, data: { ...aiResult, id: saved.id } })
  } catch (err) {
    next(err)
  }
})

// GET /api/review/history
reviewRouter.get('/history', requireAuth, async (req, res, next) => {
  try {
    const reviews = await getReviewsByUser(req.user.id)
    res.json({ success: true, data: reviews })
  } catch (err) {
    next(err)
  }
})

// GET /api/review/:id
reviewRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const review = await getReviewById(req.params.id, req.user.id)
    if (!review) return res.status(404).json({ error: 'Review not found' })
    res.json({ success: true, data: review })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/review/:id
reviewRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await deleteReview(req.params.id, req.user.id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})