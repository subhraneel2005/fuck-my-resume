# Hyperframes Composition Brief: fuck my resume

## Objective
Create a short launch-style brag video for "fuck my resume" — a job-application
copilot that turns a base resume + pasted JD into a tailored resume, cold email,
and cold DM, powered by the user's own AI API key.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20 seconds

## Source Material
- Project root: `/Users/subhraneel/Desktop/Projects/fuck-my-resume`
- Primary files read: `app/page.tsx`, `app/globals.css`, `components/navbar.tsx`,
  `components/steps/*`, `components/resume-preview.tsx`, `components/latex-preview.tsx`,
  `components/outreach-preview.tsx`, `PRD.md`
- Product name: fuck my resume (navbar wordmark: "fuck this resume")
- Tagline / strongest claim: "Paste a JD. Get everything you need to apply."
- Key UI / visual moment to recreate: the 3-step stepper (Upload resume → Paste JD →
  Generate) card and the result stack (Tailored Resume / Cold Email / Cold DM) with
  copy buttons and Download PDF.
- Copy that must appear verbatim:
  - "Paste a JD. Get everything you need to apply."
  - "Upload your resume" / "PDF up to 5MB"
  - "Paste the job description" / "We'll tailor your resume to match."
  - "You bring the key. Apply & move on."
  - Product wordmark: "fuck my resume"

## Creative Direction
- Tone preset: `default`
- Creative direction: chipper startup launch for a product whose entire personality is
  "fuck this." Bright energy, clean lime-on-white identity, playful interlocking cards.
- Interpretation: 5 scenes, comfortable holds (3-6s), short punchy lines that always
  pass the reading floor, soft-wipe transitions, 120 BPM upbeat bed driving the
  stepper + result stack. The profanity in the brand lands because the tone stays
  cheerful.
- Angle: polite ad energy pitching a swear-word utility with dead-serious value —
  humor comes from the product's bluntness, not from trying to be funny.
- Hook: "Applying to 40 jobs?" → "…and rewriting your resume 40 times?" → "Fuck that."
- Outro / punchline: wordmark slams in, tagline "You bring the key. Apply & move on."
- Avoid:
  - Generic SaaS language ("streamline your workflow" is banned)
  - Abstract filler visuals — every scene is the app or the brand
  - Unrelated visual redesign — stay on the white + lime identity

## Visual Identity
- Background: `#ffffff` (`--background: oklch(1 0 0)`)
- Text: near-black `oklch(0.145 0 0)`; muted `oklch(0.556 0 0)`
- Accent: lime `oklch(0.841 0.238 128.85)`; accent text `oklch(0.405 0.101 131.063)`
- Display font: TikTok Sans (Google Font, weight 600-800 for big type)
- Body font: TikTok Sans, weights 400-600
- Visual references from the project: sharp-cornered white cards (radius 0), lime
  primary buttons, 3-dot stepper with separators, dotted upload dropzone, Georgia
  serif resume sheet, tabs + copy buttons in the outreach card.

## Storyboard
Use `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. Hook — 3.0s — "Applying to 40 jobs?" then "…and rewriting your resume 40 times?"
   then "Fuck that." White field, giant TikTok Sans dark type.
2. Reveal — 3.5s — wordmark "fuck my resume" + tagline + three tags
   (TAILORED RESUME · COLD EMAIL · COLD DM) arriving left to right.
3. The flow — 4.5s — app card, 3-step stepper; cursor drops PDF into dropzone,
   JD textarea fills, Generate clicked; steps fill lime one by one.
4. Result stack — 6.0s — three cards land on beats: Tailored Resume (serif sheet),
   Cold Email (real copy), Cold DM (short copy); COPY buttons flash; all hold together.
5. Outro — 3.0s — full-bleed wordmark slam (beat-lock ~17.02s), tagline
   "You bring the key. Apply & move on.", lime logo mark pulses, fade to white.

## Audio
- Audio role: warm upbeat bed + tasteful interaction SFX
- Audio arc: bright bed from 0s, drives the stepper and card stack on the beat grid,
  swells slightly into the result stack, brief fade at the final logo.
- Music: `assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`
- Music treatment: volume ~0.35, start at 0, small fade-out at the end; 120 BPM pulse
  is the pacing backbone for sequential reveals.
- Music cue guidance: bundled preset copied to
  `assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json`
  (~120.2 BPM; strong cues 17.02/17.52/18.52/20.02/23.02; beat grid every ~0.5s).
  Lock the outro wordmark to ~17.02s. Stagger result cards on consecutive beats near
  11-13s but reveal card *labels* at every-other-beat pace for readability.
- Audio-reactive treatment: subtle; use RMS/bass to make the lime accent/glow and card
  presence breathe. No waveform/equalizer visuals, no strobing.
- Audio-coupled moments:
  - Stepper 1→2→3 — one soft drop per step
  - PDF drop into dropzone — click + drop
  - JD textarea fill — 2-3 short keypress ticks
  - Three result cards — card hit per arrival
  - Outro wordmark — one impact bell
- SFX selection guidance: prefer Kenney CC0 library ("skills/brag/assets/sfx/" +
  `sfx-analysis.md`): `interface/drop_*` / `interface/click_*` for cards and steps,
  `keyboard/keypress-*.wav` type ticks, `interface/bong_001` or `impactBell_heavy_000`
  at the logo. Keep volume 0.55-0.8, nothing aggressive — the words carry the punch.
- Exact SFX choice: choose filenames, timestamps, density, and volume after the visual
  animation exists and matches the actual motion.
- Audio files: music copied into `assets/music/`. Copy any chosen SFX into
  `assets/sfx/`.

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core`
(composition contract + `data-*` timing), `hyperframes-animation` (motion),
`hyperframes-creative` (design spec, beats, audio-reactive), `hyperframes-keyframes`
(seek-safe keyframes), and `hyperframes-cli` (lint/check/render). /brag is its own
workflow: do not enter the `hyperframes` entry-point intent interview and do not route
into its generic promo / launch-video workflow. Prefer native Hyperframes conventions
over anything in /brag.

Requirements:
- Show at least one real UI element from the project (prefer the app's stepper card
  and result stack — see Scene 3 and Scene 4).
- Keep all text readable in the final render (0.3s/word floor; sequential text on
  every-other-beat, not every beat).
- Keep the video at 20 seconds total.
- Include the planned music + SFX layer.
- Treat music cue metadata as optional timing hints; readability and story win.
- Major reveals may move toward strong cues within ±0.15s; smaller entrances within
  ±0.10s of beats. Use ~1-3 strong-cue locks.
- Wire at least one visual element to audio data (subtle presence/glow breathing).
- Use local assets (music already copied; SFX copied under `assets/sfx/`).
- Run `hyperframes check` before render — it is brag's single gate.