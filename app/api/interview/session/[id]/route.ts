import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { interviewSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function getSession(request: NextRequest) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const interview = await db.query.interviewSessions.findFirst({
    where: eq(interviewSessions.id, id),
  });

  if (!interview || interview.userId !== session.user.id) {
    return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
  }

  return NextResponse.json({
    session: {
      id: interview.id,
      jobTitle: interview.jobTitle,
      company: interview.company,
      difficulty: interview.difficulty,
      durationMinutes: interview.durationMinutes,
      seed: interview.seed,
      config: interview.config,
      voiceEngine: interview.voiceEngine,
      model: interview.model,
      status: interview.status,
      transcriptMarkdown: interview.transcriptMarkdown,
      feedback: interview.feedback,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    },
  });
}