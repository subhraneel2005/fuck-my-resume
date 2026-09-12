import { NextRequest, NextResponse } from "next/server";
import { transcribe } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSettings, interviewSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt, migrateApiKeyIfLegacy } from "@/lib/encryption";
import { engineConfig } from "@/lib/interview-models";
import { z } from "zod";

const bodySchema = z.object({
  sessionId: z.string().min(1),
  audioBase64: z.string().min(1),
  model: z.string().optional(),
});

async function getSession(request: NextRequest) {
  return auth.api.getSession({
    headers: request.headers,
  });
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
  const { sessionId, audioBase64, model } = parse.data;

  // The OpenAI transcription path in this ai* SDK version expects a plain
  // base64 string (not a data URL) — a "data:audio/wav;base64," prefix makes
  // convertDataContentToUint8Array base64-decode the prefix itself and throw
  // InvalidCharacterError. Strip any explicit data-URL prefix defensively.
  const base64Data = audioBase64.includes(",")
    ? audioBase64.split(",").slice(1).join(",")
    : audioBase64;

  const interview = await db.query.interviewSessions.findFirst({
    where: eq(interviewSessions.id, sessionId),
  });

  if (!interview || interview.userId !== session.user.id) {
    return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
  }

  if (interview.voiceEngine !== "openai") {
    return NextResponse.json(
      { error: "This session uses the in-browser voice engine; transcribe server-side is not used." },
      { status: 400 }
    );
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

  if (settings.provider !== "openai") {
    return NextResponse.json(
      { error: "OpenAI voice requires your BYOK provider to be OpenAI. Switch provider in Settings." },
      { status: 400 }
    );
  }

  const apiKey = decrypt(settings.apiKey);

  const migrated = migrateApiKeyIfLegacy(settings.apiKey);
  if (migrated) {
    await db
      .update(aiSettings)
      .set({ apiKey: migrated, updatedAt: new Date() })
      .where(eq(aiSettings.userId, session.user.id));
  }

  const voiceConfig = engineConfig("openai");

  const sttModel =
    model && voiceConfig.sttModels.some((m) => m.id === model)
      ? model
      : settings.sttModel && voiceConfig.sttModels.some((m) => m.id === settings.sttModel)
        ? settings.sttModel
        : voiceConfig.defaultSttModel;

  const openai = createOpenAI({ apiKey });
  const result = await transcribe({
    model: openai.transcription(sttModel),
    audio: base64Data,
  });

  return NextResponse.json({ text: result.text, language: result.language ?? null });
}