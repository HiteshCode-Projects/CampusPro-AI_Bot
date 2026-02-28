const express = require('express');
const router = express.Router();
const { generateContent } = require('../config/gemini');
const { RESUME_ROAST_PROMPT, QUOTE_CARD_PROMPT } = require('../prompts/allPrompts');
const { aiLimiter } = require('../middleware/rateLimiter');

// POST /api/creator/roast
// Resume roasting — fun but helpful
router.post('/roast', aiLimiter, async (req, res, next) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ success: false, error: 'resumeText is required' });
    }

    const prompt = RESUME_ROAST_PROMPT(resumeText);
    const roast = await generateContent(prompt, '');

    res.json({ success: true, roast });
  } catch (error) {
    next(error);
  }
});

// POST /api/creator/quote
// Generate mood-based quote card
router.post('/quote', aiLimiter, async (req, res, next) => {
  try {
    const { mood } = req.body;
    if (!mood) {
      return res.status(400).json({ success: false, error: 'mood is required' });
    }

    const prompt = QUOTE_CARD_PROMPT(mood);
    const result = await generateContent(prompt, '');

    // Parse structured result
    const quoteMatch = result.match(/QUOTE:\s*(.+)/);
    const authorMatch = result.match(/AUTHOR_VIBE:\s*(.+)/);
    const playlistMatch = result.match(/PLAYLIST:\s*(.+)/);
    const actionMatch = result.match(/ACTION:\s*(.+)/);

    res.json({
      success: true,
      quote: quoteMatch?.[1]?.trim() || result,
      author: authorMatch?.[1]?.trim() || 'Anonymous Campus Legend',
      playlist: playlistMatch?.[1]?.trim() || 'Lo-fi study beats',
      action: actionMatch?.[1]?.trim() || 'Take 3 deep breaths 🌬️',
      // Pollinations image URL built on client side
      imageSeed: encodeURIComponent(`${mood} motivational aesthetic college student`)
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/creator/poster-prompt
// Generate a good image prompt for fest poster
router.post('/poster-prompt', aiLimiter, async (req, res, next) => {
  try {
    const { festName, theme, colors } = req.body;

    const prompt = `Generate a detailed, vivid image generation prompt for a college fest poster.
    Fest Name: ${festName}
    Theme: ${theme}
    Preferred Colors: ${colors || 'vibrant, energetic'}
    
    The prompt should describe: composition, lighting, mood, style, visual elements.
    Make it suitable for Pollinations.ai image generation.
    Return ONLY the image prompt, nothing else. Under 200 characters.`;

    const imagePrompt = await generateContent(prompt, '');
    const cleanPrompt = imagePrompt.trim().replace(/"/g, '');

    res.json({
      success: true,
      imagePrompt: cleanPrompt,
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=768&nologo=true`
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
