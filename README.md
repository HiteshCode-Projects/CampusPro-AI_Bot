# 🎓 CampusBot Pro

> AI-powered college companion — MERN Stack + Google Gemini

---

## ⚡ Quick Start (3 steps)

### Step 1 — Install dependencies
```bash
# Terminal 1 — Backend
cd server
npm install

# Terminal 2 — Frontend  
cd client
npm install
```

### Step 2 — Create your .env file
```bash
cd server
node setup.js     # interactive setup — fills in your keys
```

OR manually create `server/.env`:
```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/campusbot
GEMINI_API_KEY=AIzaSy_YOUR_KEY_HERE
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Step 3 — Run
```bash
# Terminal 1 — Backend (from /server folder)
npm run dev

# Terminal 2 — Frontend (from /client folder)
npm run dev
```

Open → http://localhost:5173 🎉

---

## 🔑 Where to get your keys

| Key | Link | Time |
|-----|------|------|
| **Gemini API Key** | https://aistudio.google.com/app/apikey | 1 min |
| **MongoDB URI** | https://mongodb.com/atlas | 5 min |

---

## 🚀 Deploy to production

See **DEPLOY.md** for full step-by-step hosting guide.

| Service | What | Free |
|---------|------|------|
| Render | Backend | ✅ |
| Vercel | Frontend | ✅ |
| MongoDB Atlas | Database | ✅ |
| Google Gemini | AI API | ✅ |

---

## 🗂️ Project Structure

```
campusbot-pro/
├── server/
│   ├── .env.example     ← copy to .env and fill in your keys
│   ├── setup.js         ← run: node setup.js
│   ├── index.js
│   ├── config/          ← db.js, gemini.js
│   ├── routes/          ← chat, brainstorm, talent, creator, placement
│   ├── models/          ← MongoDB schemas
│   └── prompts/         ← all AI system prompts
│
└── client/
    ├── src/pages/       ← ChatHub, BrainSpace, TalentArena, CreatorCorner, PlacementDojo
    ├── src/styles/      ← main.css (pure CSS, no frameworks)
    └── vercel.json      ← fixes React Router on Vercel
```
