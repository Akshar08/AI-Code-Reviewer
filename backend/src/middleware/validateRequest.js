const VALID_LANGUAGES = ["auto", "javascript", "typescript", "python", "java", "go", "rust", "c", "cpp", "ruby", "php"];

export function validateReviewRequest(req, res, next) {
  const { code, language } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "code is required and must be a string" });
  }
  if (code.trim().length < 5) {
    return res.status(400).json({ error: "code is too short to review" });
  }
  if (code.length > 8000) {
    return res.status(400).json({ error: "code exceeds 8000 character limit" });
  }
  if (language && !VALID_LANGUAGES.includes(language)) {
    return res.status(400).json({ error: `Invalid language. Choose from: ${VALID_LANGUAGES.join(", ")}` });
  }

  next();
}
