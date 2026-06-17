# 🎯 CareerIQ v2 — AI-Powered Job Market Trend Analyzer

## What's New in v2
- ✅ **Groq AI** (llama-3.3-70b) replaces Gemini — free, no billing issues
- ✅ **Adzuna API** for real live job listings
- ✅ **Robust JSON parsing** — handles Groq responses with text before/after JSON
- ✅ **Mock Interview Timer** — 2-minute countdown per question
- ✅ **Roadmap progress saved to DB** — survives page refresh
- ✅ **Community pagination** — 10 posts per page
- ✅ **Real course search links** — no fake Coursera/Udemy URLs
- ✅ **Profile page** — edit name, field, skills, GitHub, LinkedIn, change password
- ✅ **Resume history** — all uploads saved, view in Profile
- ✅ **Job bookmarking** — save/unsave jobs, view in Profile
- ✅ **Dark mode** — full app dark theme, persisted in localStorage
- ✅ **Notifications** — get alerted when someone answers your question
- ✅ **Community leaderboard** — top contributors by score
- ✅ **Error boundaries** — component crashes don't break the whole app
- ✅ **Backend file validation** — MIME type + size check on resume upload

---

## Setup

### 1. Get API Keys

**Groq (free):** https://console.groq.com
**Adzuna (free tier, 250 calls/day):** https://developer.adzuna.com

### 2. Configure Environment
Edit `server/.env`:
```
GROQ_API_KEY=your_groq_key
ADZUNA_APP_ID=your_app_id
ADZUNA_API_KEY=your_api_key
```
> Without Adzuna keys the app still works — it uses fallback job data.

### 3. Install & Run
```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev

# Terminal 2 — Frontend
cd client
npm install
npm start
```

MongoDB must be running: `mongod`

App opens at: **http://localhost:3000**

---

## Feature Guide

| Feature | Where |
|---------|-------|
| Set field of interest | Dashboard → dropdown |
| Dark mode toggle | Sidebar → 🌙 button |
| Notifications | Sidebar → 🔔 bell |
| Interview timer | Mock Interview → countdown top-right |
| Save roadmap progress | Roadmap → "Mark Done" buttons |
| Resume history | Profile → Resume History section |
| Save jobs | Jobs page → 🔖 Save button |
| View saved jobs | Profile → Saved Jobs section |
| Edit profile/password | Profile page |
| Leaderboard | Community → Leaderboard tab |
| Course search links | Courses → "Search on Platform →" |

