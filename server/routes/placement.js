const express = require('express');
const router = express.Router();
const { InterviewSession } = require('../models');
const { generateContent, generateChat } = require('../config/gemini');
const {
  DSA_PROBLEM_PROMPT,
  DSA_HINT_PROMPT,
  MOCK_INTERVIEW_PROMPT,
  RESUME_FORGE_PROMPT
} = require('../prompts/allPrompts');
const { aiLimiter } = require('../middleware/rateLimiter');

// ─── DSA ARENA ───────────────────────────────────────

// POST /api/placement/dsa/problem
router.post('/dsa/problem', aiLimiter, async (req, res, next) => {
  try {
    const { topic, difficulty } = req.body;
    if (!topic || !difficulty) {
      return res.status(400).json({ success: false, error: 'topic and difficulty required' });
    }

    const prompt = DSA_PROBLEM_PROMPT(topic, difficulty);
    const problem = await generateContent(prompt, '');

    res.json({ success: true, problem });
  } catch (error) {
    next(error);
  }
});

// POST /api/placement/dsa/hint
router.post('/dsa/hint', aiLimiter, async (req, res, next) => {
  try {
    const { problem, approach, hintLevel } = req.body;
    if (!problem || !approach) {
      return res.status(400).json({ success: false, error: 'problem and approach required' });
    }

    const prompt = DSA_HINT_PROMPT(problem, approach, hintLevel || 1);
    const hint = await generateContent(prompt, '');

    res.json({ success: true, hint });
  } catch (error) {
    next(error);
  }
});

// ─── MOCK INTERVIEW ──────────────────────────────────

// POST /api/placement/interview/start
router.post('/interview/start', aiLimiter, async (req, res, next) => {
  try {
    const { nickname, company, round } = req.body;
    if (!nickname || !company || !round) {
      return res.status(400).json({ success: false, error: 'nickname, company, round required' });
    }

    const systemPrompt = MOCK_INTERVIEW_PROMPT(company, round, nickname);
    const firstMessage = await generateContent(systemPrompt, 'Start the interview now.');

    const session = await InterviewSession.create({
      nickname,
      company,
      round,
      messages: [{ role: 'assistant', content: firstMessage }]
    });

    res.json({ success: true, sessionId: session._id, message: firstMessage });
  } catch (error) {
    next(error);
  }
});

// POST /api/placement/interview/respond
router.post('/interview/respond', aiLimiter, async (req, res, next) => {
  try {
    const { sessionId, answer } = req.body;
    if (!sessionId || !answer) {
      return res.status(400).json({ success: false, error: 'sessionId and answer required' });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    const systemPrompt = MOCK_INTERVIEW_PROMPT(session.company, session.round, session.nickname);
    const aiResponse = await generateChat(systemPrompt, session.messages, answer);

    session.messages.push({ role: 'user', content: answer });
    session.messages.push({ role: 'assistant', content: aiResponse });
    await session.save();

    res.json({ success: true, message: aiResponse });
  } catch (error) {
    next(error);
  }
});

// POST /api/placement/interview/end
router.post('/interview/end', aiLimiter, async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    const feedbackPrompt = `
    Based on this interview conversation, give a final comprehensive feedback report.
    
    Give scores (out of 10) for:
    - Communication: X/10
    - Technical Knowledge: X/10
    - Problem Solving: X/10
    - Confidence: X/10
    
    Overall verdict (1 sentence).
    Top 2 strengths.
    Top 2 areas to improve.
    Final hiring likelihood: Strong Yes / Maybe / Not Yet
    `;

    const feedback = await generateChat(feedbackPrompt, session.messages, 'Give final feedback now.');

    session.finalFeedback = feedback;
    session.completed = true;
    await session.save();

    res.json({ success: true, feedback });
  } catch (error) {
    next(error);
  }
});

// ─── RESUME FORGE ────────────────────────────────────

// POST /api/placement/resume/forge
router.post('/resume/forge', aiLimiter, async (req, res, next) => {
  try {
    const { formData } = req.body;
    if (!formData) {
      return res.status(400).json({ success: false, error: 'formData is required' });
    }

    const prompt = RESUME_FORGE_PROMPT(formData);
    const resume = await generateContent(prompt, '');

    res.json({ success: true, resume });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
