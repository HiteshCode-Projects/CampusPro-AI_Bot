const rateLimit = require('express-rate-limit');

// General API limiter — 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests. Please slow down! ⏳' },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for AI routes — 30 per 15 minutes (to protect Gemini quota)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, error: 'AI request limit reached. Try again in 15 minutes 🤖' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { apiLimiter, aiLimiter };
