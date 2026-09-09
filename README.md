<p align="center">
  <img src="public/Fuck%20my%20Resume%20Banner.png" alt="Fuck My Resume Banner" width="100%" />
</p>

Tired of your resume gathering dust? **Fuck My Resume** turns a boring PDF into a fresh, job-tailored resume — then helps you land the gig with cold outreach and a live AI mock interview. This app runs **100% on your own API keys** — bring your own, delete your data, no subscription wall.

---

## ✨ Features

### 🎯 Tailored Resume in One Click
- Upload your existing resume (PDF) and paste the **job description** you're chasing.
- The AI rewrites and tailors your resume to that exact role — then generates clean, professional **LaTeX** ready to download as `.tex`.
- Contact links (LinkedIn, GitHub) are pulled straight from your PDF, so they always point to the real URLs.

### 📧 Cold Outreach That Doesn't Suck
- Provide a job description and get a polished **cold email** and a snappy **cold DM** — written with your tailored resume in hand.
- Copy-paste ready. Fire and forget.

### 🗣️ AI Mock Interviewer (Voice)
A Minecraft-style mock interview, but for your career. Create your interview "world," pick your settings, and the AI interviewer talks to you out loud:

- **World settings** — difficulty (Peaceful → Hard 🌱🔥), duration (5–30 min), and a **seed** that deterministically generates your interviewer's questions (🎲 to randomize).
- **Live preview** — watch your interviewer's persona, focus areas, and tone update as you type the job description.
- **Hold-to-talk voice loop** — the interviewer greets you out loud, you answer by holding the mic, it listens (STT), follows up (LLM), and speaks back (TTS). Context is kept locally so refreshes don't lose your place.
- **Free or premium voice** — use your own **OpenAI** key for best-quality speech, or the **free in-browser voice** (Whisper + Kokoro) that runs locally, no API cost.
- **Written feedback** — when the timer runs out, you get a strengths / weaknesses / next-steps review plus a full transcript, saved to your account.

### 🔐 Bring Your Own Key (BYOK)
- Add either an **OpenAI** or **Google AI** API key under **AI Settings**.
- Your key is encrypted server-side. No server-side secrets, no middleman API charges — every AI call is billed to *you*, or free in-browser for the interviewer's voice.

### 🔒 Your Data, Your Call
- Google sign-in via Better Auth.
- Interview transcripts and feedback are stored on your account; your resume/outreach stays in your hands.

---

## 🚀 Quick Start (for users)

1. **Sign in** with Google.
2. Go to **AI Settings**, paste your **OpenAI** or **Google AI** API key.
3. Upload your resume → paste the job description → hit **Generate**.
4. Download your tailored `.tex`, use the outreach copy, and rehearse with the **Mock Interviewer**.

---

## 🧠 Technical Overview

Architecture & stack powering the product.

### Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **UI:** Tailwind CSS + shadcn/ui
- **Auth:** Better Auth (Google OAuth, cookies)
- **Database:** Drizzle ORM on Neon/Postgres (`lib/db/schema.ts`)
- **AI:** Vercel AI SDK (`ai` v7) with `@ai-sdk/openai` and `@ai-sdk/google`

### Key modules
| Area | Where |
| --- | --- |
| Resume parsing + LaTeX | `lib/pdf-parser.ts`, `lib/latex-renderer.ts`, `lib/template-renderer.ts` |
| Outreach generation | `api/generate-outreach`, `lib/outreach-generator.ts` |
| AI provider settings | `api/settings/ai-provider`, `components/settings/ai-provider-form.tsx` |
| Interview config (seeded, deterministic) | `lib/interview-config.ts`, `lib/interview-models.ts` |
| Interview APIs (chat/STT/TTS/session) | `api/interview/*` |
| Browser voice engine (Whisper + Kokoro) | `lib/interview-browser-voice.ts`, `lib/audio.ts` |

### How the mock interviewer works
- **Turn-based, no WebSocket:** each exchange is `record → transcribe (STT) → LLM (chat) → speak (TTS)`.
- Configured via a **seeded PRNG** (`hashString` + murmur-style mulberry32) so the same seed + job description + difficulty always produces the same interviewer config — like a Minecraft world seed.
- **Voice engines:** OpenAI (`gpt-4o-mini-transcribe` / `gpt-4o-mini-tts`) or free in-browser (transformers.js Whisper-tiny + `kokoro-js`). Google STT isn't exposed by `@ai-sdk/google`, so Google voice is excluded — Google users get the free browser voice.
- **BYOK enforcement:** every server route decrypts the user's API key at call time and 403s to `/settings` when missing. No server-side keys.
- **Persistence:** the live conversation lives in `localStorage`; on completion the transcript (markdown) + LLM feedback JSON are saved to the `interview_sessions` table.

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
BETTER_AUTH_SECRET=...   # also used as the encryption key for users' API keys
```
