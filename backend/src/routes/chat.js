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
Keep responses concise and practical.

IMPORTANT: You must ALWAYS respond with a valid JSON object in this exact format:
{
  "reply": "your conversational response here",
  "shouldUpdateCode": true or false,
  "updatedCode": "the full updated code here, or null if no update",
  "changeSummary": "brief 1-2 sentence summary of what you changed, or null if no update"
}

Set shouldUpdateCode to true ONLY when the user is explicitly asking you to fix, improve, rewrite, or update their code.
Examples that should trigger shouldUpdateCode=true:
- "fix my code", "fix the bugs", "make it better", "improve this", "rewrite this", "make it score higher", "apply the fixes", "update the code"

Examples that should NOT trigger shouldUpdateCode (just answer the question):
- "what does this bug mean?", "why is this bad?", "explain this error", "how do I fix X"

When shouldUpdateCode is true, updatedCode must contain the COMPLETE improved code (not just snippets).
The improved code should target a score of 9-10/10.`

chatRouter.post('/:reviewId', requireAuth, async (req, res, next) => {
  try {
    const { reviewId } = req.params
    const { message, code, reviewContext } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' })
    }

    const history = await getChatHistory(reviewId, req.user.id)

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
Bugs found: ${JSON.stringify(reviewContext?.bugs || [])}
`,
      },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const raw = response.choices[0].message.content
    let parsed

    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = { reply: raw, shouldUpdateCode: false, updatedCode: null, changeSummary: null }
    }

    const { reply, shouldUpdateCode, updatedCode, changeSummary } = parsed

    // Save to DB
    await saveChatMessage(reviewId, req.user.id, 'user', message)
    await saveChatMessage(reviewId, req.user.id, 'assistant', reply)

    res.json({
      success: true,
      data: {
        reply,
        shouldUpdateCode: !!shouldUpdateCode,
        updatedCode: shouldUpdateCode ? updatedCode : null,
        changeSummary: shouldUpdateCode ? changeSummary : null,
      }
    })
  } catch (err) {
    next(err)
  }
})

chatRouter.get('/:reviewId', requireAuth, async (req, res, next) => {
  try {
    const history = await getChatHistory(req.params.reviewId, req.user.id)
    res.json({ success: true, data: history })
  } catch (err) {
    next(err)
  }
})