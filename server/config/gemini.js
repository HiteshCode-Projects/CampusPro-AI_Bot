const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// gemini-1.5-flash-8b has the highest free tier quota:
// 1500 requests/day, 15 requests/minute — best for demos & webinars
const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Sleep helper for retry backoff
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper — retries up to 3 times on 429 with exponential backoff
 */
const withRetry = async (fn, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('Too Many Requests');
      if (is429 && attempt < retries) {
        const waitMs = attempt * 3000; // 3s, 6s, 9s
        console.log(`⏳ Rate limited. Retrying in ${waitMs / 1000}s... (attempt ${attempt}/${retries})`);
        await sleep(waitMs);
      } else {
        // Clean up the error message before throwing
        if (is429) {
          throw new Error('AI is a bit busy right now. Please wait a few seconds and try again! ⏳');
        }
        throw err;
      }
    }
  }
};

/**
 * Single-turn generation (no history)
 */
const generateContent = async (systemPrompt, userMessage) => {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(
      `${systemPrompt}\n\nUser: ${userMessage}`
    );
    return result.response.text();
  });
};

/**
 * Multi-turn chat (with history for ongoing conversations)
 */
const generateChat = async (systemPrompt, history, newMessage) => {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemPrompt,
    });

    const geminiHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  });
};

module.exports = { generateContent, generateChat };
