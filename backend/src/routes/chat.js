import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { getChatHistory, saveChatMessage } from '../db/queries.js'
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
export const chatRouter = Router()

const SYSTEM_PROMPT = `You are a helpful code review assistant. You ONLY answer questions related to code, programming, debugging, and software development.

If the user asks about anything unrelated to code or programming, politely decline and redirect them back to discussing their code.

You will be given the user's code and the AI review results as context. Use this to give specific, helpful answers.

When providing code examples, always use proper markdown code blocks with the language specified.
Keep responses concise and practical.`

// POST /api/chat/:reviewId — send a message
chatRouter.post('/:reviewId', requireAuth, async (req, res, next) => {
  try {
    const { reviewId } = req.params
    const { message, code, reviewContext } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' })
    }

    // Get existing chat history for this review
    const history = await getChatHistory(reviewId, req.user.id)

    // Build messages array for OpenAI
    const messages = [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}

Here is the code being reviewed:
\`\`\`
${code || 'No code provided'}
\`\`\`

Here is the AI review summary:
Score: ${reviewContext?.score || 'N/A'}/10
Summary: ${reviewContext?.summary || 'N/A'}
Bugs found: ${reviewContext?.bugs?.length || 0}
`,
      },
      // Include past conversation history
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.4,
      max_tokens: 1000,
    })

    const reply = response.choices[0].message.content

    // Save both user message and assistant reply to DB
    await saveChatMessage(reviewId, req.user.id, 'user', message)
    await saveChatMessage(reviewId, req.user.id, 'assistant', reply)

    res.json({ success: true, data: { reply } })
  } catch (err) {
    next(err)
  }
})

// GET /api/chat/:reviewId — get chat history
chatRouter.get('/:reviewId', requireAuth, async (req, res, next) => {
  try {
    const history = await getChatHistory(req.params.reviewId, req.user.id)
    res.json({ success: true, data: history })
  } catch (err) {
    next(err)
  }
})