const express = require('express');
const router = express.Router();
const { Chat } = require('../models');
const { generateChat } = require('../config/gemini');
const { CHAT_MODES } = require('../prompts/allPrompts');
const { aiLimiter } = require('../middleware/rateLimiter');

// POST /api/chat
// Send a message and get AI response
router.post('/', aiLimiter, async (req, res, next) => {
  try {
    const { nickname, message, mode, sessionId } = req.body;

    if (!nickname || !message || !mode) {
      return res.status(400).json({
        success: false,
        error: 'nickname, message, and mode are required'
      });
    }

    const systemPrompt = CHAT_MODES[mode] || CHAT_MODES.study;

    // Find existing session or create new one
    let session = sessionId
      ? await Chat.findById(sessionId)
      : null;

    if (!session) {
      session = new Chat({ nickname, mode, messages: [] });
    }

    // Get AI response using full history for context
    const aiResponse = await generateChat(
      systemPrompt,
      session.messages,
      message
    );

    // Save both messages to DB
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: aiResponse });
    await session.save();

    res.json({
      success: true,
      sessionId: session._id,
      response: aiResponse,
      mode
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/chat/history/:sessionId
// Load previous chat history
router.get('/history/:sessionId', async (req, res, next) => {
  try {
    const session = await Chat.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
