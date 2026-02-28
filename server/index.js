// ── Load .env FIRST before anything else ────────────────────
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// ── Validate required env vars before starting ───────────────
const REQUIRED_VARS = ['MONGO_URI', 'GEMINI_API_KEY'];
const missing = REQUIRED_VARS.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error(`
❌ Missing environment variables: ${missing.join(', ')}

👉 Fix: Create a file called  .env  inside the  server/  folder
   with these lines:

   MONGO_URI=mongodb+srv://...
   GEMINI_API_KEY=AIza...

📄 See server/.env.example for the template.
  `);
  process.exit(1);
}

connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(apiLimiter);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '🎓 CampusBot Pro API is running!',
    version: '1.0.0',
    env: process.env.NODE_ENV,
  });
});

app.use('/api/chat',       require('./routes/chat'));
app.use('/api/brainstorm', require('./routes/brainstorm'));
app.use('/api/talent',     require('./routes/talent'));
app.use('/api/creator',    require('./routes/creator'));
app.use('/api/placement',  require('./routes/placement'));

app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ CampusBot Pro running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
