# 🎯 CareerIQ v2 — AI-Powered Job Market Trend Analyzer

CareerIQ is an AI-powered job market trend analyzer designed to help college students make smarter career decisions. It uses Groq Llama 3.3-70B AI for resume analysis, skill gap detection, and personalized career roadmaps, along with real-time job listings from the Adzuna API. The platform also includes features like mock interviews, job bookmarking, community discussions, and progress tracking to provide an end-to-end career guidance system.

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

