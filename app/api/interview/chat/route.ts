import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSettings, interviewSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { DEFAULT_BRAIN_MODEL } from "@/lib/interview-models";
import { z } from "zod";
import type { InterviewConfig } from "@/lib/interview-config";

const bodySchema = z.object({
  sessionId: z.string().min(1),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .default([]),
});

async function getSession(request: NextRequest) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

function buildInterviewerPrompt(config: InterviewConfig, interview: {
  jobDescription: string;
  jobTitle: string | null;
  company: string | null;
  difficulty: string;
  durationMinutes: number;
  seed: string;
}): string {
  const role = interview.jobTitle || "the role described in the job description";
  return `You are ${config.interviewerPersona}, conducting a live audio mock job interview with the candidate.

ROLE BEING HIRED FOR: ${role}${interview.company ? ` at ${interview.company}` : ""}

JOB DESCRIPTION:
${interview.jobDescription}

INTERVIEW SETTINGS:
- Difficulty: ${interview.difficulty} (tone: ${config.tone})
- Total length: ${interview.durationMinutes} minutes
- Focus areas (cover in this rough order): ${config.focusAreas.join(", ")}
- Approximate number of questions: ${config.questionCount}
- Pace: ${config.pace}
- Follow-up depth: up to ${config.followUpDepth} follow-ups per answer
- Random seed: ${interview.seed}

RULES:
- You are audio-only. You speak your questions out loud, ONE question at a time. Never answer for the candidate.
- Greet the candidate briefly, then ask the first interview question.
- After each candidate answer, ask a short focused follow-up (up to ${config.followUpDepth} deep) or move to the next question.
- Probe when an answer is thin or vague. Keep every utterance conversational and concise — you are speaking, not writing an essay.
- Near the end of the interview, ask 1-2 closing questions, thank the candidate, and stop.
- Stay fully in character as ${config.interviewerPersona}, with a ${config.tone} tone.`;
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
  const { sessionId, messages } = parse.data;

  const interview = await db.query.interviewSessions.findFirst({
    where: eq(interviewSessions.id, sessionId),
  });

  if (!interview || interview.userId !== session.user.id) {
    return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
  }

  if (interview.status !== "active") {
    return NextResponse.json({ error: "Interview already ended" }, { status: 409 });
  }

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
  const apiKey = decrypt(settings.apiKey);
  const modelId =
    interview.model || settings.interviewerModel || DEFAULT_BRAIN_MODEL[provider];

  const model =
    provider === "google"
      ? createGoogleGenerativeAI({ apiKey })(modelId as any)
      : createOpenAI({ apiKey })(modelId as any);

  const systemPrompt = buildInterviewerPrompt(
    interview.config as unknown as InterviewConfig,
    {
      jobDescription: interview.jobDescription,
      jobTitle: interview.jobTitle,
      company: interview.company,
      difficulty: interview.difficulty,
      durationMinutes: interview.durationMinutes,
      seed: interview.seed,
    }
  );

  const conversation = messages
    .map((m) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}:\n${m.content}`)
    .join("\n\n");

  const { text } = await generateText({
    model,
    instructions: systemPrompt,
    prompt: `${conversation}\n\nInterviewer:`,
  });

  return NextResponse.json({ text });
}