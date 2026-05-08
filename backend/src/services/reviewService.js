import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the provided code and return a JSON object with this exact structure:
{
  "score": <integer 1-10>,
  "language": "<detected language>",
  "summary": "<2-3 sentence overall assessment>",
  "bugs": [
    { "line": <line number or null>, "severity": "critical|warning|info", "message": "<description>", "fix": "<suggested fix>" }
  ],
  "improvements": [
    { "category": "performance|readability|security|best-practices", "message": "<description>", "example": "<code example or null>" }
  ],
  "positives": ["<thing done well>"]
}
Return ONLY valid JSON. No markdown, no explanation outside the JSON.`;

export async function reviewCode(code, language = "auto") {
  const userPrompt = `Review this ${language === "auto" ? "" : language + " "}code:\n\n\`\`\`\n${code}\n\`\`\``;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content;
  const review = JSON.parse(raw);

  return {
    ...review,
    tokensUsed: response.usage?.total_tokens ?? 0,
    reviewedAt: new Date().toISOString(),
  };
}
