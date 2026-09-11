import { NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSettings, interviewSessions, user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { describeLlmError } from "@/lib/llm-errors";
import { z } from "zod";
import type { InterviewConfig } from "@/lib/interview-config";

const bodySchema = z.object({
  transcriptMarkdown: z.string().optional().default(""),
});

const feedbackSchema = z.object({
  score: z.number().int().min(1).max(10),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
});

type Feedback = z.infer<typeof feedbackSchema>;

async function getSession(request: NextRequest) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parse = bodySchema.safeParse(await request.json().catch(() => ({})));
  const transcriptMarkdown = parse.success ? parse.data.transcriptMarkdown : "";

  const interview = await db.query.interviewSessions.findFirst({
    where: eq(interviewSessions.id, id),
  });

  if (!interview || interview.userId !== session.user.id) {
    return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
  }

  const settings = await db.query.aiSettings.findFirst({
    where: eq(aiSettings.userId, session.user.id),
  });

  let feedback: Feedback | null = null;
  if (settings) {
    try {
      feedback = await generateFeedback(settings, interview, transcriptMarkdown);
    } catch (error) {
      console.error("Interview feedback error:", error);
      const info = describeLlmError(error);
      return NextResponse.json(
        {
          error: info.message,
          code: info.code,
          redirect: info.toSettings ? "/settings" : undefined,
        },
        { status: 500 }
      );
    }
  }

  const wasCompleted = interview.status === "completed";

  await db
    .update(interviewSessions)
    .set({
      status: "completed",
      transcriptMarkdown: transcriptMarkdown || null,
      feedback: feedback || null,
      score: feedback?.score ?? null,
      updatedAt: new Date(),
    })
    .where(eq(interviewSessions.id, id));

  if (!wasCompleted) {
    await db
      .update(user)
      .set({
        mockInterviewsCompleted: sql`${user.mockInterviewsCompleted} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));
  }

  return NextResponse.json({ feedback });
}

async function generateFeedback(
  settings: {
    provider: string;
    apiKey: string;
    interviewerModel: string | null;
  },
  interview: {
    model: string;
    config: unknown;
    jobDescription: string;
    difficulty: string;
    durationMinutes: number;
    jobTitle: string | null;
  },
  transcriptMarkdown: string
): Promise<Feedback> {
  const provider = settings.provider as "openai" | "google";
  const apiKey = decrypt(settings.apiKey);
  const modelId =
    interview.model || settings.interviewerModel || (provider === "google" ? "gemini-3.5-flash" : "gpt-5.4-mini");

  const model =
    provider === "google"
      ? createGoogleGenerativeAI({ apiKey })(modelId as any)
      : createOpenAI({ apiKey })(modelId as any);

  const config = interview.config as unknown as InterviewConfig;

  const { output } = await generateText({
    model,
    instructions: `You are a senior technical hiring coach. Review the mock interview transcript and produce honest, specific, actionable feedback.

Target role: ${interview.jobTitle || "the role in the job description"}.
Interview difficulty: ${interview.difficulty} (tone: ${config.tone}).
Length: ${interview.durationMinutes} minutes.

Rules:
- score: an integer from 1 to 10 rating overall performance (10 = exceptional, 1 = poor). Be honest and calibrate across candidates — a good but imperfect performance should land in the 6-8 range.
- summary: 2-3 sentences on overall performance.
- strengths: 3-6 concrete strengths shown in the interview.
- weaknesses: 3-6 specific areas to improve, tied to the candidate's actual answers.
- suggestions: 3-6 actionable, concrete next steps (frameworks to learn, answer structure, projects, etc.).
- Be direct and specific. Do not invent things that did not happen.`,
    prompt: `INTERVIEW CONFIG:\n${JSON.stringify(config, null, 2)}\n\nJOB DESCRIPTION:\n${interview.jobDescription}\n\nINTERVIEW TRANSCRIPT:\n${transcriptMarkdown || "(empty transcript)"}`,
    output: Output.object({ schema: feedbackSchema }),
  });

  return output;
}