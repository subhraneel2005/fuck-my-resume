import type { Difficulty } from "@/lib/interview-models";

export interface InterviewConfig {
  title: string;
  interviewerPersona: string;
  tone: string;
  focusAreas: string[];
  questionCount: number;
  pace: "slow" | "medium" | "fast";
  followUpDepth: 1 | 2 | 3;
}

const DIFFICULTY_PRESETS: Record<
  Difficulty,
  { tone: string; pace: InterviewConfig["pace"]; followUpDepth: InterviewConfig["followUpDepth"]; minutesPerQuestion: number }
> = {
  peaceful: { tone: "warm, supportive, and encouraging", pace: "slow", followUpDepth: 1, minutesPerQuestion: 3 },
  easy: { tone: "friendly, clear, and straightforward", pace: "slow", followUpDepth: 1, minutesPerQuestion: 2.5 },
  normal: { tone: "professional, balanced, and fair", pace: "medium", followUpDepth: 2, minutesPerQuestion: 2 },
  hard: { tone: "sharp, demanding, and probing", pace: "fast", followUpDepth: 3, minutesPerQuestion: 1.5 },
};

const TITLES = [
  "The Gauntlet",
  "The Crucible",
  "Mountain Pass",
  "The Forge",
  "Endless Terrain",
  "The Foundry",
  "Stone & Steel",
  "Valley of Verdicts",
  "The Summit",
  "Storm Lord",
  "The Observatory",
  "Deep Caverns",
];

const PERSONAS = [
  "Alex Rivera — Senior Engineering Manager",
  "Jordan Lee — Staff Software Engineer",
  "Priya Sharma — Principal Engineer",
  "Marcus Chen — VP of Engineering",
  "Sofia Alvarez — Tech Lead",
  "Daniel Okafor — Engineering Director",
  "Maya Patel — Head of Product Engineering",
];

const FOCUS_AREAS = [
  "Introduction & Background",
  "Behavioral Questions",
  "Technical Deep Dive",
  "System Design",
  "Coding Problem (DSA)",
  "Domain Knowledge",
  "Problem-Solving Scenarios",
  "Communication & Collaboration",
];

// ─── Deterministic seeded PRNG ───

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSeed(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(rand: () => number, arr: readonly T[], n: number): T[] {
  const pool = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

// Same (seed, jd, difficulty, durationMinutes) => identical config, like a
// Minecraft world seed. The JD is mixed in so the interview adapts to the role.
export function generateInterviewConfig(params: {
  seed: string;
  jd: string;
  difficulty: Difficulty;
  durationMinutes: number;
}): InterviewConfig {
  const { seed, jd, difficulty, durationMinutes } = params;
  const preset = DIFFICULTY_PRESETS[difficulty];

  const rand = mulberry32(
    hashString(`${seed}\u0000${difficulty}\u0000${durationMinutes}\u0000${jd.trim().toLowerCase()}`)
  );

  const questionCount = Math.min(
    12,
    Math.max(2, Math.round(durationMinutes / preset.minutesPerQuestion))
  );

  return {
    title: pick(rand, TITLES),
    interviewerPersona: pick(rand, PERSONAS),
    tone: preset.tone,
    focusAreas: pickN(rand, FOCUS_AREAS, 4),
    questionCount,
    pace: preset.pace,
    followUpDepth: preset.followUpDepth,
  };
}

export interface InterviewMessage {
  role: "user" | "assistant";
  content: string;
}

export function buildInterviewMarkdown(messages: InterviewMessage[]): string {
  return messages
    .map((m, i) => {
      const label = m.role === "assistant" ? "**Interviewer**" : "**Candidate**";
      return `### Q${Math.floor(i / 2) + 1}\n\n${label}: ${m.content}`;
    })
    .join("\n\n");
}