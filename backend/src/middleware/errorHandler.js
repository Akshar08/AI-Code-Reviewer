export function errorHandler(err, req, res, next) {
  console.error("[Error]", err.message);

  if (err?.status === 401) {
    return res.status(401).json({ error: "Invalid API key. Check your OPENAI_API_KEY." });
  }
  if (err?.status === 429) {
    return res.status(429).json({ error: "OpenAI rate limit exceeded. Try again shortly." });
  }
  if (err instanceof SyntaxError) {
    return res.status(500).json({ error: "AI returned malformed response. Please retry." });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
}
