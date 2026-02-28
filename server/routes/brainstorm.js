const express = require('express');
const router = express.Router();
const { Idea } = require('../models');
const { generateContent } = require('../config/gemini');
const { BRAINSTORM_PROMPT } = require('../prompts/allPrompts');
const { aiLimiter } = require('../middleware/rateLimiter');

// POST /api/brainstorm
// Expand a rough idea into a full plan
router.post('/', aiLimiter, async (req, res, next) => {
  try {
    const { nickname, idea } = req.body;

    if (!nickname || !idea) {
      return res.status(400).json({ success: false, error: 'nickname and idea are required' });
    }

    const prompt = BRAINSTORM_PROMPT(idea);
    const aiOutput = await generateContent(prompt, '');

    // Save to DB
    const savedIdea = await Idea.create({ nickname, rawIdea: idea, aiOutput });

    res.json({ success: true, ideaId: savedIdea._id, output: aiOutput });

  } catch (error) {
    next(error);
  }
});

// GET /api/brainstorm/vault/:nickname
// Get all saved ideas for a student
router.get('/vault/:nickname', async (req, res, next) => {
  try {
    const ideas = await Idea.find({ nickname: req.params.nickname }).sort({ savedAt: -1 });
    res.json({ success: true, ideas });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/brainstorm/:ideaId
router.delete('/:ideaId', async (req, res, next) => {
  try {
    await Idea.findByIdAndDelete(req.params.ideaId);
    res.json({ success: true, message: 'Idea deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
