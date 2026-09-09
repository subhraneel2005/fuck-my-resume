# Work Todos — AI Mock Interviewer

> Check `[ ]` as tasks complete. Everything runs on the user's BYOK key — no server key fallback.

## Schema & Migration

- [x] Add `interview_sessions` table + relations to `lib/db/schema.ts`
- [x] Extend `ai_settings` with voice/interview columns (`voice_engine`, `interview_model`, `stt_model`, `tts_model`, `tts_voice`)
- [x] Generate drizzle migration for the schema changes

## Config & Constants

- [x] Create `lib/interview-models.ts` (engine options, STT/TTS/voice lists + defaults)
- [x] Create `lib/interview-config.ts` (seeded PRNG + deterministic interview config generator)

## Settings API

- [x] Extend `POST /api/settings/ai-provider` for interview prefs + engine validation (Google → browser only)
- [x] Extend settings UI (`AiProviderForm`) with interviewer voice card + info banner

## Interview API routes

- [x] `POST /api/interview/session` — create session (JD validation, engine check, key check)
- [x] `POST /api/interview/transcribe` — OpenAI STT via BYOK key
- [x] `POST /api/interview/chat` — interviewer brain via BYOK key (server-built prompt)
- [x] `POST /api/interview/tts` — OpenAI TTS via BYOK key
- [x] `POST /api/interview/session/[id]/complete` — save markdown + generate feedback
- [x] `GET /api/interview/session/[id]` — results (feedback + transcript)

## Interview UI

- [x] Client audio utils (MediaRecorder → PCM 16k Float32Array + WAV)
- [x] `/interview` setup page — Minecraft-style world card (JD, difficulty, duration, seed + live preview, engine picker)
- [x] `lib/interview-config.ts` client live preview wiring
- [x] `/interview/session/[id]` live page — record → transcribe → chat → TTS loop, localStorage context, timer
- [x] Browser voice engine (whisper-tiny via `@huggingface/transformers`, Kokoro via `kokoro-js`)
- [x] Results view (feedback + markdown transcript)
- [x] Navbar "Mock Interview" link + `/interview` in route guard

## Verify

- [x] Install deps (`@huggingface/transformers`, `kokoro-js`) — confirm no `@google/genai` needed
- [x] `npm run typecheck` passes
- [x] `npm run build` passes