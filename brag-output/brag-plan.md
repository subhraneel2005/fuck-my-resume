# Brag Plan: fuck my resume

## What is this app?
"Fuck My Resume" (navbar wordmark: *fuck this resume*) is a job-application copilot.
Upload your resume once, paste any job description, and it generates a tailored
ATS-friendly resume, a cold email, and a cold DM — all powered by your own AI API key.

## The angle
A chipper startup launch video for a product whose entire personality is "I am done
with this." Every frame is polite and upbeat while the words say exactly what job
hunters are thinking. The humor comes from the contrast: clean lime-on-white
consumer polish pitching a swear-word product with dead-serious utility
("Paste a JD. Get everything you need to apply").

## Hook (first 2-3 seconds)
Giant TikTok-Sans dark text on plain white: "Applying to 40 jobs?"
Second line slams: "And rewriting your resume 40 times?" — pause — the setup lands,
then the product's voice answers for the viewer: "Fuck that."

## Key moments (the middle)
- The 3-step stepper from the app (1 👤 · 2 🚚 PDF · 3 📋 JD) advancing on beat —
  real UI, real sequence.
- Upload dropzone: "Upload your resume — PDF up to 5MB" — a cursor drops a file,
  filename appears.
- "Paste the job description" textarea fills with a real-looking JD.
- The result stack pops in one by one: **Tailored Resume** (Georgia-serif white
  resume preview), **Cold Email**, **Cold DM** — three cards, three beats, each
  showing real product copy.

## Outro / punchline
Product wordmark full-bleed: **fuck my resume** with the tagline
"Paste a JD. Get everything you need to apply." Then the PRD's own closer,
small and deadpan: "You bring the key. Apply & move on."

## User flow worth showing
Upload resume PDF → Paste JD → Generate → tailored resume + cold email + cold DM,
ready to copy and apply. The three-step stepper IS the flow, so the centerpiece
scenes cut between the app's real screens.

## Tone
- Preset: `default`
- Creative direction: chipper launch video for a product whose entire personality is
  "fuck this" — upbeat, clean, playful, never try-hard. The profanity lands precisely
  because the energy stays bright.
- Interpretation: 5 scenes, comfortable 3-6s holds, short punchy lines (0.3s/word
  floor), lime-on-white identity, card/stepper UI recreations, soft-wipe transitions.

## Format: landscape — 1920x1080
## Duration: 20 seconds

## Visual identity (from the project)
- Background: `#ffffff` (root `--background: oklch(1 0 0)`)
- Accent: vivid lime green `oklch(0.841 0.238 128.85)` (root `--primary`); dark green
  text variant `oklch(0.405 0.101 131.063)` (`--primary-foreground`)
- Text: near-black `oklch(0.145 0 0)` (`--foreground`); muted grays `oklch(0.556 0 0)`
- Display font: **TikTok Sans** (loaded in `globals.css`, body weight 600)
- Body font: TikTok Sans, weight 400-600
- Radius: 0 (sharp corners, filled-in shadcn theme)
- Strongest visual element: the sharp-cornered white card + lime stepper / buttons on
  white, and the Georgia/Times-NR serif resume preview inside the app

## Share copy (draft)
Rewriting your resume for every job is a scam. fuck my resume turns any JD into a
tailored resume + cold email + cold DM in one click. You bring the API key — it does
the work.

## Audio direction
- Role: warm upbeat bed + tasteful interaction SFX
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` (full upbeat track,
  120 BPM)
- Music treatment: start at 0, volume ~0.35, ride under scene changes, small fade-out
  under the final logo hold. The 120 BPM pulse should drive the 3-step stepper and
  the 3-card result stack.
- Audio-reactive treatment: subtle; use RMS/bass to give the lime accent glow and the
  product cards a soft presence breathe. No waveform/equalizer visuals.
- SFX posture: moderate, motion-matched. Soft drops for card/stepper arrivals, a
  couple of key/click accents for the simulated upload and JD typing, one bell hit
  when the product wordmark lands.
- Audio-coupled moments:
  - Stepper advancing 1→2→3 — one soft drop per step
  - Upload drop — a click + drop when the PDF lands
  - JD textarea filling — 2-3 short keypress ticks
  - Three result cards arriving — one card hit per card (beat-staggered)
  - Outro wordmark — one impact bell
- Restraint rule: no aggressive cues; keep everything bright and light — the punch is
  in the words, not the volume.

## Music cue guidance
Track: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`, ~120.2 BPM. Preset read
from `assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json`.
Beat grid every ~0.5s (3.02, 3.52, 4.02, 4.53, 5.03 ...). Strong cues in the
0-25s window: **17.02, 17.52, 18.52, 20.02, 23.02, 23.52**.
- Lock the outro wordmark to strong cue **17.02s** (within ±0.15).
- Stagger the three result cards on the beat grid near 11-13s (consecutive beats) —
  but reveal the *labels* at only every-other-beat pace so lines stay readable.
- Stepper steps 1→2→3 can snap to beats near 6.5-8.5s.
Readability always wins; treat cues as hints.

## Storyboard

### Scene 1 — Hook — 3.0s
White field. Line 1 slides+blurs in: **"Applying to 40 jobs?"** (holds ~1.2s settled).
Line 2 slams in: **"...and rewriting your resume 40 times?"** (holds ~1.2s settled).
Blank beat (~0.5s) → hard cut.
Sequential/interaction: yes — two lines appear one after another, each with a hold.
Audio intent: warm, sly setup; second line slightly punchier.
Audio-coupled idea: text slams on beat; no typing.
Music: vol-1 bed, starts here.
Transition mood: hard cut → Scene 2

### Scene 2 — Reveal — 3.5s
Product wordmark **fuck my resume** scales in center (lime accent kicker above it).
Tagline fades up beneath: **"Paste a JD. Get everything you need to apply."**
Three tags pop in a row: **TAILORED RESUME · COLD EMAIL · COLD DM** (each ~0.8s settled).
Sequential/interaction: yes — three tags arrive left to right.
Audio intent: bright, satisfied — the reveal exhales.
Audio-coupled idea: wordmark slam + three tag drops.
Music: bed; accent on wordmark.
Transition mood: soft wipe → Scene 3

### Scene 3 — The flow (upload + JD) — 4.5s
Recreate the app card with the 3-step stepper at top (1 👤 ✓ 2 · 3). Simulated cursor:
drops a real PDF into the dashed dropzone — filename **Subhraneel_Resume.pdf** appears.
Stepper 2 fills lime. Next: "Paste the job description" textarea fills with 2 lines of a
real-looking senior-AI-engineer JD. Stepper 3 fills lime. Lime **Generate** button; cursor
clicks it.
Sequential/interaction: yes — full simulated interaction: drop, type snippet, click.
Audio intent: playful productivity — things clicking into place.
Audio-coupled idea: click on drop, key ticks on JD fill, click on Generate.
Music: bed at ~0.35.
Transition mood: hard cut → Scene 4

### Scene 4 — The result stack — 6.0s
App result view. Three white cards arrive one by one on beats (~1.9s apart):
1. **Tailored Resume** — Georgia-serif white sheet, "Software Engineer" header — Download PDF.
2. **Cold Email** — line of real copy: "Saw you're hiring for X — your team clearly values Y..."
3. **Cold DM** — short line: "Hey — I pitched a similar system at Z. 3 jobs in 90 seconds here."
"COPY" buttons flash on each. All three hold on screen together.
Sequential/interaction: yes — 3 cards, one per beat, then hold.
Audio intent: payoff — things landing perfectly.
Audio-coupled idea: card hit per arrival (staggered to beats near 11-13s), light copy-tick.
Music: bed swells slightly; cards snap to grid.
Transition mood: soft crossfade → Scene 5

### Scene 5 — Outro — 3.0s
Full-bleed white. Wordmark **fuck my resume** slams in (beat-lock 17.02s strong cue).
Tagline under it: **"You bring the key. Apply & move on."** Logo mark (simple lime square)
pulses once. Hold. Fade to white.
Sequential/interaction: no.
Audio intent: buttoned-up close — one bell, then let the tagline sit.
Audio-coupled idea: impact bell on wordmark; subtle fade.
Music: brief fade-out at the very end.
Transition mood: fade out.

**Music mood for this video:** upbeat, clean, chipper corporate-but-not-boring.
**Audio summary:** a bright 120 BPM bed carries the reveal, drives the stepper and the
three-card stack on the beat grid, and closes on one clean bell hit over the wordmark.