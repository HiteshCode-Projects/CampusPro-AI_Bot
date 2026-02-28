const mongoose = require('mongoose');

// ─── CHAT MODEL ──────────────────────────────────────
const chatSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  mode: { type: String, enum: ['fest', 'placement', 'study', 'rant'], default: 'study' },
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant'] },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

// ─── IDEA (BRAINSTORM) MODEL ─────────────────────────
const ideaSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  rawIdea: { type: String, required: true },
  aiOutput: { type: String },
  savedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ─── TALENT MODEL ────────────────────────────────────
const talentSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  category: {
    type: String,
    enum: ['poetry', 'project', 'art', 'music', 'photography', 'meme', 'writing'],
    required: true
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  aiFeedback: { type: String },
  scores: {
    creativity: Number,
    originality: Number,
    expression: Number,
    overall: Number
  },
  badge: { type: String },
  votes: {
    fire: { type: Number, default: 0 },
    heart: { type: Number, default: 0 },
    mindblown: { type: Number, default: 0 }
  }
}, { timestamps: true });

// ─── INTERVIEW SESSION MODEL ─────────────────────────
const interviewSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  company: { type: String, required: true },
  round: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant'] },
      content: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  finalFeedback: { type: String },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = {
  Chat: mongoose.model('Chat', chatSchema),
  Idea: mongoose.model('Idea', ideaSchema),
  Talent: mongoose.model('Talent', talentSchema),
  InterviewSession: mongoose.model('InterviewSession', interviewSchema)
};
