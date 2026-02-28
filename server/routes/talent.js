const express = require('express');
const router = express.Router();
const { Talent } = require('../models');
const { generateContent } = require('../config/gemini');
const { SCORE_TALENT } = require('../prompts/allPrompts');
const { aiLimiter } = require('../middleware/rateLimiter');

// POST /api/talent/submit
// Submit a talent entry and get AI scoring
router.post('/submit', aiLimiter, async (req, res, next) => {
  try {
    const { nickname, category, title, content } = req.body;

    if (!nickname || !category || !title || !content) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }

    // Get AI feedback
    const prompt = SCORE_TALENT(category, content, nickname);
    const aiFeedback = await generateContent(prompt, '');

    // Parse scores from AI response (basic extraction)
    const scoreMatch = aiFeedback.match(/Overall Vibe:\s*(\d+)\/10/i);
    const creativityMatch = aiFeedback.match(/Creativity:\s*(\d+)\/10/i);
    const originalityMatch = aiFeedback.match(/Originality:\s*(\d+)\/10/i);
    const expressionMatch = aiFeedback.match(/Expression:\s*(\d+)\/10/i);
    const badgeMatch = aiFeedback.match(/🏆 TALENT BADGE\n(.+)/);

    const scores = {
      creativity: creativityMatch ? parseInt(creativityMatch[1]) : 7,
      originality: originalityMatch ? parseInt(originalityMatch[1]) : 7,
      expression: expressionMatch ? parseInt(expressionMatch[1]) : 7,
      overall: scoreMatch ? parseInt(scoreMatch[1]) : 7
    };

    const badge = badgeMatch ? badgeMatch[1].trim() : 'Campus Star ⭐';

    const talent = await Talent.create({
      nickname,
      category,
      title,
      content,
      aiFeedback,
      scores,
      badge
    });

    res.json({ success: true, talent });

  } catch (error) {
    next(error);
  }
});

// GET /api/talent/feed
// Get all talent entries sorted by overall score
router.get('/feed', async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const talents = await Talent.find(filter).sort({ 'scores.overall': -1 }).limit(20);
    res.json({ success: true, talents });
  } catch (error) {
    next(error);
  }
});

// PUT /api/talent/vote/:id
// Add an emoji vote to a talent
router.put('/vote/:id', async (req, res, next) => {
  try {
    const { emoji } = req.body; // 'fire' | 'heart' | 'mindblown'
    const validEmojis = ['fire', 'heart', 'mindblown'];

    if (!validEmojis.includes(emoji)) {
      return res.status(400).json({ success: false, error: 'Invalid emoji vote' });
    }

    const talent = await Talent.findByIdAndUpdate(
      req.params.id,
      { $inc: { [`votes.${emoji}`]: 1 } },
      { new: true }
    );

    res.json({ success: true, votes: talent.votes });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
