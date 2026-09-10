# Features & Todos

Track the app's features and their todos. A feature moves to `Completed` once every todo is checked off.

---

## In Progress

### Leaderboard — Hall of Fame
Public leaderboard ranking users by average AI-interview score (out of 10), ties broken by number of interviews given.

- [x] DB: `interview_sessions.score` column + `user.mock_interviews_completed` counter (migration 0003 with backfill)
- [x] Complete route: LLM outputs an honest 1-10 score, persisted; completion counter incremented once (idempotent)
- [x] Public `/api/leaderboard` — avg score + interview count per user, score-first / count-tiebreak, top 50
- [x] Leaderboard page — polls every 30s, manual refresh, skeleton, top-3 medals, highlights the signed-in user's row
- [x] Navbar Leaderboard link (visible signed-out + signed-in)
- [x] Results page shows the X/10 score badge + a Leaderboard link
- [x] Typecheck + build pass

### AI Interviewer — No Clock Eaten by Browser Model Downloads
The interview timer must not start while the free in-browser voice/STT models are still downloading at the start.

- [x] Timer starts only after the browser voice models are fully downloaded
- [x] Real download progress bars (loaded/total from the model loader) at start — not mocked
- [x] Both voice + speech-recognition models preloaded before the greeting, so the first answer doesn't stall the clock either
- [x] Typecheck + build pass

---

## Completed

### AI Interviewer — Push-to-Talk UX (shipped)
- [x] Start-of-interview dialog explaining the hold-to-talk mic
- [x] Keyboard hold-to-talk: press and hold Space to talk, release to answer
- [x] Pointer + keyboard inputs can't double-trigger a recording
- [x] Hint text mentions the Space-bar alternative
- [x] Typecheck + build pass

### AI Interview Page — Google Meet-style UI (shipped)
- [x] Side-by-side call layout — user profile circle (left) / AI persona tile (right)
- [x] Persona scaled up (size-56) to match the user avatar circle
- [x] Hold-to-talk mic centered at the bottom middle
- [x] End Interview button moved to the top-left corner
- [x] Slim top bar with meeting title + timer + progress (Meet-style)
- [x] Active-participant ring indicators (speaking/listening/recording)
- [x] Preserve tap-to-hear fallback for autoplay-blocked audio
- [x] Typecheck + build pass

### AI Interview Page — Voice Loop Core (shipped)
- [x] Turn-based voice loop: record -> transcribe -> interviewer chat -> TTS
- [x] OpenAI voice engine (gpt-4o-mini-tts + transcribe, `marin` voice)
- [x] In-browser voice engine (whisper-tiny + kokoro, `am_michael` voice)
- [x] Seeded "interview world" config (difficulty, duration, interviewer persona)
- [x] Sessions + results persisted to DB; transcript cached in localStorage
- [x] Auto-greeting via TTS with tap-to-hear fallback (autoplay-policy safe)
- [x] Animated AI Persona (Rive) drives the interviewer's listening/thinking/speaking states
- [x] AI Elements Persona installed as the sole component from that library

### Hugeicons Animated Icons (shipped)
- [x] Installed 19 hover-animated icons as source via shadcn CLI
- [x] Replaced react-icons across navbar, landing, settings, interview, previews
- [x] Removed the untracked ai-elements experiment that broke the build

### BYOK (Bring Your Own Key) (shipped)
- [x] Encrypted per-user API keys with OpenAI / Google providers
- [x] Settings UI with provider engine + interviewer voice configuration
- [x] 403 redirect to /settings when no key / unsupported feature