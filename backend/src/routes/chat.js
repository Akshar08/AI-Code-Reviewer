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

You will be given the user's code and the AI review results as context.

You must ALWAYS respond with a valid JSON object in this exact format:
{
  "reply": "your detailed conversational response here",
  "shouldUpdateCode": true or false,
  "updatedCode": "the full updated code here, or null if no update",
  "changeSummary": "brief 1-2 sentence summary of what changed overall"
}

WHEN shouldUpdateCode is true:
1. "updatedCode" must contain the COMPLETE improved code — never partial snippets
2. Add inline comments in the code on EVERY line you changed or added, using this format:
   - For fixes: // FIXED: what you fixed and why
   - For additions: // ADDED: what you added and why  
   - For removals: replace removed code with a comment: // REMOVED: what was here and why it was removed
3. "reply" must include ALL of these sections:
   - A short intro saying what you did overall
   - A numbered list of EVERY change made, referencing the exact line numbers
   - For each change: what the old code was, what the new code is, and WHY it was changed
   - A closing note estimating the new score
   Example reply format:
   "I've updated your code with the following fixes:\n\n1. Line 4 — Changed xhr.open(..., false) to xhr.open(..., true): The third parameter being 'false' made this a synchronous request which blocks the main thread. Changed to 'true' for async.\n\n2. Line 5-8 — Added onload handler: ..."
4. "changeSummary" is a short 1-sentence summary for the banner (e.g. "Fixed synchronous XHR, added error handling, removed var declarations")

WHEN shouldUpdateCode is false:
- Just answer the question helpfully with code examples in markdown code blocks where relevant
- "updatedCode" must be null
- "changeSummary" must be null

Set shouldUpdateCode to true ONLY when the user explicitly asks to fix, improve, rewrite, or update code.
Triggers: "fix", "improve", "make it better", "make it score higher", "rewrite", "update the code", "apply fixes"
NOT triggers: "explain", "what does", "why is", "how do I", "what is"`

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
Bugs: ${JSON.stringify(reviewContext?.bugs || [])}
Improvements: ${JSON.stringify(reviewContext?.improvements || [])}
`,
      },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.2,
      max_tokens: 3000,
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