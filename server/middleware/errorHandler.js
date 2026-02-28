const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // ── Rate limit / quota exceeded ──────────────────
  if (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('Too Many Requests')) {
    return res.status(429).json({
      success: false,
      error: 'AI is a bit busy right now. Please wait a few seconds and try again! ⏳'
    });
  }

  // ── Invalid API key ───────────────────────────────
  if (err.message?.includes('API_KEY') || err.message?.includes('401') || err.message?.includes('403')) {
    return res.status(401).json({
      success: false,
      error: 'Invalid Gemini API key. Check your .env file and restart the server.'
    });
  }

  // ── Model not found ───────────────────────────────
  if (err.message?.includes('404') || err.message?.includes('not found')) {
    return res.status(500).json({
      success: false,
      error: 'AI model unavailable. Check your Gemini API key permissions.'
    });
  }

  // ── MongoDB validation ────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, error: messages.join(', ') });
  }

  // ── Generic fallback — never expose raw error ─────
  res.status(err.status || 500).json({
    success: false,
    error: err.message?.length < 120 ? err.message : 'Something went wrong. Please try again.'
  });
};

module.exports = errorHandler;
