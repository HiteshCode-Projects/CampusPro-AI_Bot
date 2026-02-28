# 🚀 CampusBot Pro — Deployment Guide
## Everything goes LIVE in under 15 minutes

---

## 📋 What You Need (all free, no credit card)

| Service | Purpose | Link |
|---------|---------|------|
| GitHub | Code hosting | https://github.com |
| MongoDB Atlas | Database (free M0) | https://mongodb.com/atlas |
| Google AI Studio | Gemini API key | https://aistudio.google.com |
| Render | Backend hosting | https://render.com |
| Vercel | Frontend hosting | https://vercel.com |

---

## STEP 1 — Prepare Your API Keys

### 🔑 Get Gemini API Key (2 minutes)
1. Go to → https://aistudio.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy it — looks like: `AIzaSy...`

### 🍃 Get MongoDB URI (5 minutes)
1. Go to → https://mongodb.com/atlas → Sign Up Free
2. Create a **free M0 cluster** (any region)
3. **Database Access** → Add New User
   - Username: `campusbot`
   - Password: something strong → **Copy it!**
   - Role: **Atlas Admin**
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
5. **Connect** → **Drivers** → Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `myFirstDatabase` with `campusbot`
   - Result: `mongodb+srv://campusbot:<password>@cluster0.xxxxx.mongodb.net/campusbot`

---

## STEP 2 — Push to GitHub

```bash
# In the campusbot-pro folder
git init
git add .
git commit -m "🎓 CampusBot Pro - initial deploy"

# Create a new repo on github.com then:
git remote add origin https://github.com/YOUR_USERNAME/campusbot-pro.git
git branch -M main
git push -u origin main
```

---

## STEP 3 — Deploy Backend on Render

1. Go to → https://render.com → **Sign up with GitHub**
2. Click **"New +"** → **"Web Service"**
3. Connect your `campusbot-pro` repo
4. Fill in settings:

| Setting | Value |
|---------|-------|
| **Name** | `campusbot-pro-server` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

5. Scroll down → **"Environment Variables"** → Add these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | your MongoDB Atlas connection string |
| `GEMINI_API_KEY` | your Gemini API key |
| `CLIENT_URL` | *(leave blank for now — fill after Step 4)* |

6. Click **"Create Web Service"**
7. Wait ~3 minutes for it to build
8. ✅ Copy your server URL — looks like: `https://campusbot-pro-server.onrender.com`

---

## STEP 4 — Deploy Frontend on Vercel

1. Go to → https://vercel.com → **Sign up with GitHub**
2. Click **"Add New..."** → **"Project"**
3. Import your `campusbot-pro` repo
4. Fill in settings:

| Setting | Value |
|---------|-------|
| **Root Directory** | `client` |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

5. **Environment Variables** → Add:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | your Render URL from Step 3 |

6. Click **"Deploy"**
7. Wait ~2 minutes
8. ✅ Copy your frontend URL — looks like: `https://campusbot-pro.vercel.app`

---

## STEP 5 — Connect Frontend → Backend (Final Step!)

Go back to **Render** → your service → **Environment** → update:

| Key | Value |
|-----|-------|
| `CLIENT_URL` | your Vercel URL from Step 4 |

Click **"Save Changes"** → Render will redeploy automatically (~1 min)

---

## ✅ You're Live!

Open your Vercel URL → Enter a nickname → Start chatting 🎉

**Share the link with your webinar audience right now!**

---

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| Backend shows "Application error" | Check Render logs → Environment Variables tab |
| "Failed to fetch" on frontend | Check `VITE_API_BASE_URL` has no trailing slash |
| Chat returns 429 error | Gemini rate limit — wait 60 seconds |
| MongoDB connection failed | Check Network Access → Allow 0.0.0.0/0 |
| Page 404 on refresh | `vercel.json` should be in the `client` folder |
| Render app sleeping | Free tier sleeps after 15 min — first request takes ~30s to wake |

---

## 💡 Keep Render Awake (Optional)

Free Render services sleep after 15 minutes of inactivity.
To keep it awake during your webinar, use UptimeRobot (free):

1. Go to → https://uptimerobot.com → Sign up free
2. **Add New Monitor** → HTTP(S)
3. URL: `https://campusbot-pro-server.onrender.com`
4. Interval: **5 minutes**

This pings your server every 5 minutes — keeps it awake all day!
