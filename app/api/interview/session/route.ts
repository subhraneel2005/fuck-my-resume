import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSettings, interviewSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { z } from "zod";
import {
  enginesForProvider,
  DEFAULT_BRAIN_MODEL,
  type VoiceEngine,
} from "@/lib/interview-models";
import {
  generateInterviewConfig,
  generateSeed,
} from "@/lib/interview-config";

const bodySchema = z.object({
  jobDescription: z
    .string()
    .min(20, "Paste the job description first (min 20 characters)."),
  difficulty: z
    .enum(["peaceful", "easy", "normal", "hard"])
    .default("normal"),
  durationMinutes: z.number().int().min(5).max(60).default(10),
  seed: z.string().optional(),
  voiceEngine: z.enum(["openai", "browser"]).optional(),
  interviewerModel: z.string().optional(),
});

async function getSession(request: NextRequest) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

function extractRoleInfo(jd: string): { jobTitle: string | null; company: string | null } {
  const lines = jd.split("\n");
  let jobTitle: string | null = null;
  let company: string | null = null;

  for (const line of lines) {
    const titleMatch = line.match(
      /(?:role|position|job title|job|title)\s*[::\-]\s*(.+)/i
    );
    const companyMatch = line.match(
      /(?:company|organization|employer)\s*[::\-]\s*(.+)/i
    );
    if (titleMatch && !jobTitle) {
      jobTitle = titleMatch[1].trim().replace(/[.*\[\]]/g, "").slice(0, 120) || null;
    }
    if (companyMatch && !company) {
      company = companyMatch[1].trim().slice(0, 120) || null;
    }
  }

  if (!jobTitle) {
    const first = lines.find((l) => l.trim().length > 0);
    if (first) {
      jobTitle = first.trim().replace(/[#*\[\]]/g, "").slice(0, 120) || null;
    }
  }

  return { jobTitle, company };
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parse = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parse.success) {
    return NextResponse.json(
      { error: parse.error.issues[0]?.message || "Invalid request body" },
      { status: 400 }
    );
  }

  const body = parse.data;

  const settings = await db.query.aiSettings.findFirst({
    where: eq(aiSettings.userId, session.user.id),
  });

  if (!settings) {
    return NextResponse.json(
      { error: "No BYOK key configured", redirect: "/settings" },
      { status: 403 }
    );
  }

  const provider = settings.provider as "openai" | "google";
  const availableEngines = enginesForProvider(provider);

  const voiceEngine: VoiceEngine =
    body.voiceEngine || (settings.voiceEngine as VoiceEngine) || availableEngines[0];

  if (!availableEngines.includes(voiceEngine)) {
    return NextResponse.json(
      { error: `Voice engine '${voiceEngine}' is not available for provider '${provider}'.` },
      { status: 400 }
    );
  }

  const interviewerModel =
    body.interviewerModel ||
    settings.interviewerModel ||
    DEFAULT_BRAIN_MODEL[provider];

  const seed = (body.seed || "").trim() || generateSeed();
  const config = generateInterviewConfig({
    seed,
    jd: body.jobDescription,
    difficulty: body.difficulty,
    durationMinutes: body.durationMinutes,
  });

  const { jobTitle, company } = extractRoleInfo(body.jobDescription);

  const sessionId = randomUUID();

  await db.insert(interviewSessions).values({
    id: sessionId,
    userId: session.user.id,
    jobTitle,
    company,
    jobDescription: body.jobDescription,
    difficulty: body.difficulty,
    durationMinutes: body.durationMinutes,
    seed,
    config: config as unknown as object,
    voiceEngine,
    model: interviewerModel,
    status: "active",
  });

  return NextResponse.json({
    sessionId,
    config,
    seed,
    voiceEngine,
    model: interviewerModel,
    durationMinutes: body.durationMinutes,
    difficulty: body.difficulty,
    jobTitle,
    company,
  });
}