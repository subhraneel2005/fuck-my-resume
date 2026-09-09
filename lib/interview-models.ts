export type Provider = "openai" | "google";
export type VoiceEngine = "openai" | "browser";

export type Difficulty = "peaceful" | "easy" | "normal" | "hard";

export interface ModelOption {
  id: string;
  label: string;
  description?: string;
}

export interface VoiceEngineConfig {
  id: VoiceEngine;
  label: string;
  description: string;
  free: boolean;
  sttModels: ModelOption[];
  defaultSttModel: string;
  ttsModels: ModelOption[];
  defaultTtsModel: string;
  voices: ModelOption[];
  defaultVoice: string;
}

// A provider's voice is only selectable for the mock interviewer when the SDK
// supports its speech-to-text. Google STT is NOT exposed by @ai-sdk/google, so
// Google voice is excluded — only OpenAI voice or the free in-browser voice.
export const VOICE_ENGINES: Record<VoiceEngine, VoiceEngineConfig> = {
  openai: {
    id: "openai",
    label: "OpenAI Voice",
    description:
      "Uses your own OpenAI API key for speech-to-text (gpt-4o-mini-transcribe) and text-to-speech (gpt-4o-mini-tts). Best quality. All usage is billed to your key.",
    free: false,
    sttModels: [
      {
        id: "gpt-4o-mini-transcribe",
        label: "GPT-4o Mini Transcribe",
        description: "Fast and affordable. Recommended for live answers.",
      },
      {
        id: "gpt-4o-transcribe",
        label: "GPT-4o Transcribe",
        description: "Higher accuracy, higher cost.",
      },
      {
        id: "whisper-1",
        label: "Whisper-1",
        description: "Legacy general-purpose speech recognition.",
      },
    ],
    defaultSttModel: "gpt-4o-mini-transcribe",
    ttsModels: [
      {
        id: "gpt-4o-mini-tts",
        label: "GPT-4o Mini TTS",
        description: "Newest, most reliable realtime text-to-speech.",
      },
      {
        id: "tts-1",
        label: "TTS-1",
        description: "Lower latency, lower quality.",
      },
      {
        id: "tts-1-hd",
        label: "TTS-1 HD",
        description: "Higher quality, higher latency.",
      },
    ],
    defaultTtsModel: "gpt-4o-mini-tts",
    voices: [
      { id: "alloy", label: "Alloy", description: "Versatile, neutral" },
      { id: "ash", label: "Ash", description: "Warm and earnest" },
      { id: "ballad", label: "Ballad", description: "Soft and melodic" },
      { id: "coral", label: "Coral", description: "Bright and calm" },
      { id: "echo", label: "Echo", description: "Balanced, rounded" },
      { id: "fable", label: "Fable", description: "Expressive, British" },
      { id: "marin", label: "Marin", description: "Recommended - best quality" },
      { id: "cedar", label: "Cedar", description: "Recommended - best quality" },
      { id: "nova", label: "Nova", description: "Friendly, warm" },
      { id: "onyx", label: "Onyx", description: "Deep, authoritative" },
      { id: "sage", label: "Sage", description: "Smooth, professional" },
      { id: "shimmer", label: "Shimmer", description: "Bright and upbeat" },
      { id: "verse", label: "Verse", description: "Crisp, clear" },
    ],
    defaultVoice: "marin",
  },
  browser: {
    id: "browser",
    label: "Free (In-Browser)",
    description:
      "Whisper tiny (speech-to-text) + Kokoro 82M (text-to-speech) run locally in your browser. No API cost for voice — but accuracy and voice quality are lower than OpenAI. The interviewer's brain still uses your BYOK key.",
    free: true,
    sttModels: [
      {
        id: "whisper-tiny",
        label: "Whisper Tiny",
        description: "Runs locally via transformers.js. ~40 MB model, cached after the first load.",
      },
    ],
    defaultSttModel: "whisper-tiny",
    ttsModels: [
      {
        id: "kokoro-82m",
        label: "Kokoro 82M",
        description: "MIT-licensed open TTS running locally. ~80 MB model, cached after the first load.",
      },
    ],
    defaultTtsModel: "kokoro-82m",
    voices: [
      { id: "am_michael", label: "Michael", description: "American English, male" },
      { id: "am_liam", label: "Liam", description: "American English, male" },
      { id: "am_adam", label: "Adam", description: "American English, male" },
      { id: "am_onyx", label: "Onyx", description: "American English, male" },
      { id: "am_fenrir", label: "Fenrir", description: "American English, male" },
      { id: "am_puck", label: "Puck", description: "American English, male" },
      { id: "af_heart", label: "Heart", description: "American English, female" },
      { id: "af_nova", label: "Nova", description: "American English, female" },
      { id: "af_sarah", label: "Sarah", description: "American English, female" },
      { id: "af_kore", label: "Kore", description: "American English, female" },
      { id: "af_alloy", label: "Alloy", description: "American English, female" },
      { id: "bf_emma", label: "Emma", description: "British English, female" },
      { id: "bm_george", label: "George", description: "British English, male" },
      { id: "bm_daniel", label: "Daniel", description: "British English, male" },
    ],
    defaultVoice: "am_michael",
  },
};

export const INTERVIEWER_BRAIN_MODELS: Record<Provider, ModelOption[]> = {
  openai: [
    {
      id: "gpt-5.4-mini",
      label: "GPT-5.4 Mini",
      description: "Fast and cost-effective. Recommended.",
    },
    { id: "gpt-5.4", label: "GPT-5.4", description: "Higher intelligence, higher cost." },
    { id: "gpt-4o", label: "GPT-4o", description: "Stable general-purpose model." },
  ],
  google: [
    {
      id: "gemini-3.5-flash",
      label: "Gemini 3.5 Flash",
      description: "Fast and cost-effective. Recommended.",
    },
    { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash", description: "Newer Flash, good balance." },
    { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash", description: "Most intelligent Flash model." },
  ],
};

export const DEFAULT_BRAIN_MODEL: Record<Provider, string> = {
  openai: "gpt-5.4-mini",
  google: "gemini-3.5-flash",
};

export const INTERVIEW_DIFFICULTIES: { id: Difficulty; label: string; description: string }[] = [
  { id: "peaceful", label: "Peaceful", description: "Warm, supportive, low pressure" },
  { id: "easy", label: "Easy", description: "Friendly and straightforward" },
  { id: "normal", label: "Normal", description: "Professional, balanced, fair" },
  { id: "hard", label: "Hard", description: "Sharp, demanding, probing" },
];

export const INTERVIEW_DURATIONS = [5, 10, 15, 30] as const;

export const INTERVIEW_NOT_SUPPORTED_BANNER =
  "The AI Mock Interviewer supports OpenAI voice (bring your own OpenAI API key) or the free in-browser voice (Whisper + Kokoro). Google voice models are not supported for the mock interviewer — switch your BYOK provider to OpenAI to unlock the OpenAI interviewer voice, or keep Google and use the free in-browser voice.";

// Which voices a provider can use.
export function enginesForProvider(provider: Provider): VoiceEngine[] {
  return provider === "openai" ? ["openai", "browser"] : ["browser"];
}

export function engineConfig(engine: VoiceEngine): VoiceEngineConfig {
  return VOICE_ENGINES[engine];
}