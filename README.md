<p align="center">
  <img src="public/Fuck%20my%20Resume%20Banner.png" alt="Fuck My Resume Banner" width="100%" />
</p>

Tired of your resume gathering dust? **Fuck My Resume** turns a boring PDF into a fresh, job-tailored resume — then helps you land the gig with cold outreach, a live AI mock interview, and a public leaderboard to flex your score. This app runs **100% on your own API keys** — bring your own, delete your data, no subscription wall.

[**Star on GitHub**](https://github.com/subhraneel2005/fuck-my-resume) · [**Launch on Product Hunt**](https://www.producthunt.com/products/fuck-my-resume)

---

## ✨ Features

### 🎯 Tailored Resume in One Click
- Upload your existing resume (PDF) and paste the **job description** you're chasing.
- The AI rewrites and tailors your resume to that exact role, then hands you a clean, professional resume as a **downloadable PDF** (rendered entirely in your browser) or **LaTeX** (`.tex`).
- Contact links (LinkedIn, GitHub) are pulled straight from your PDF, so they always point to the real URLs.
- **Every AI change is highlighted** — added bullets, rewritten bullets, and new skills are color-coded so you can audit exactly what the AI did before you download.

### 📧 Cold Outreach That Doesn't Suck
- Provide a job description and get a polished **cold email** and a snappy **cold DM** — written with your tailored resume in hand.
- Copy-paste ready. Fire and forget.

### 🗣️ AI Mock Interviewer (Voice)
A Minecraft-style mock interview, but for your career. Create your interview "world," pick your settings, and the AI interviewer talks to you out loud:

- **World settings** — difficulty (Peaceful → Hard 🌱🔥), duration (5–30 min), and a **seed** that deterministically generates your interviewer's questions (🎲 to randomize).
- **Live preview** — watch your interviewer's persona, focus areas, and tone update as you type the job description.
- **Hold-to-talk voice loop** — the interviewer greets you out loud, you answer by holding the mic, it listens (STT), follows up (LLM), and speaks back (TTS). Context is kept locally so refreshes don't lose your place.
- **Free or premium voice** — use your own **OpenAI** key for best-quality speech, or the **free in-browser voice** (Whisper + Kokoro) that runs locally, no API cost.
- **Scored feedback** — when the timer runs out, you get an honest **score out of 10**, a strengths / weaknesses / next-steps review, and a full transcript saved to your account.

### 🏆 Public Leaderboard
- Every completed mock interview posts to the **Hall of Fame** — ranked by average score, then interview count.
- Top 3 get badges. Sign in and find yourself in the ranks.

### 🔐 Bring Your Own Key (BYOK)
- Add either an **OpenAI** or **Google AI** API key under **AI Settings** — it powers the resume tailor, outreach, and the interviewer's brain.
- Your key is encrypted server-side. No server-side secrets, no middleman API charges — every AI call is billed to *you*, or free in-browser for the interviewer's voice.

### 🔒 Your Data, Your Call
- **Google or GitHub** sign-in via Better Auth.
- Interview transcripts and feedback are stored on your account; your resume/outreach stays in your hands.

---

## 🚀 Quick Start (for users)

1. **Sign in** with Google or GitHub.
2. Go to **AI Settings**, paste your **OpenAI** or **Google AI** API key.
3. Upload your resume → paste the job description → hit **Generate**.
4. Download your tailored **PDF** (or `.tex`), use the outreach copy, and rehearse with the **Mock Interviewer** — then climb the leaderboard.

---

## 🧠 Technical Overview

Architecture & stack powering the product.

### Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **UI:** Tailwind CSS + shadcn/ui
- **Auth:** Better Auth (Google + GitHub OAuth, cookies)
- **Database:** Drizzle ORM on Neon/Postgres (`lib/db/schema.ts`)
- **AI:** Vercel AI SDK (`ai` v7) with `@ai-sdk/openai` and `@ai-sdk/google`
- **PDF:** `@react-pdf/renderer` (`components/pdf-resume.tsx`) — compiled in the browser, no server-side LaTeX toolchain

### Key modules
| Area | Where |
| --- | --- |
| Resume parsing + LaTeX | `lib/pdf-parser.ts`, `lib/latex-renderer.ts`, `lib/template-renderer.ts` |
| PDF download (client-side) | `components/pdf-resume.tsx`, `components/latex-preview.tsx` |
| Outreach generation | `api/generate-outreach`, `lib/outreach-generator.ts` |
| AI provider settings | `api/settings/ai-provider`, `components/settings/ai-provider-form.tsx` |
| Interview config (seeded, deterministic) | `lib/interview-config.ts`, `lib/interview-models.ts` |
| Interview APIs (chat/STT/TTS/session) | `api/interview/*` |
| Feedback scoring | `api/interview/session/[id]/complete` (score 1–10 via structured output) |
| Leaderboard | `api/leaderboard`, `app/leaderboard/page.tsx` |
| Browser voice engine (Whisper + Kokoro) | `lib/interview-browser-voice.ts`, `lib/audio.ts` |

### How the mock interviewer works
- **Turn-based, no WebSocket:** each exchange is `record → transcribe (STT) → LLM (chat) → speak (TTS)`.
- Configured via a **seeded PRNG** (`hashString` + murmur-style mulberry32) so the same seed + job description + difficulty always produces the same interviewer config — like a Minecraft world seed.
- **Voice engines:** OpenAI (`gpt-4o-mini-transcribe` / `gpt-4o-mini-tts`) or free in-browser (transformers.js Whisper-tiny + `kokoro-js`). Google STT isn't exposed by `@ai-sdk/google`, so Google voice is excluded — Google users get the free browser voice.
- **BYOK enforcement:** every server route decrypts the user's API key at call time and 403s to `/settings` when missing. No server-side keys.
- **Persistence:** the live conversation lives in `localStorage`; on completion the transcript (markdown) + LLM feedback JSON (with a **score 1–10**) are saved to the `interview_sessions` table, and `user.mock_interviews_completed` increments for the leaderboard.

### Notable gotchas solved along the way
- Current `ai` SDK's OpenAI `transcribe` expects a **plain base64 string**, not a `data:...;base64,` URL — the prefix makes its decoder throw `InvalidCharacterError`.
- `generateSpeech` returns MP3 (`audio/mpeg`) for OpenAI TTS.
- Browser autoplay policies block programmatic TTS without a gesture → the interviewer auto-greets but offers a one-tap "hear it" fallback and a suspended-`AudioContext` guard.
- STT/TTS model + voice values are validated against the active voice engine when saved, so stale "kokoro" values can never leak into an OpenAI call.

### Environment
```env
DATABASE_URL=postgres://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...        # GitHub OAuth callback: /api/auth/callback/github
GITHUB_CLIENT_SECRET=...
BETTER_AUTH_SECRET=...      # also used as the encryption key for users' API keys
```
