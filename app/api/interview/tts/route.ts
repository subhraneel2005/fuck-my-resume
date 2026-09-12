import { NextRequest, NextResponse } from "next/server";
import { generateSpeech } from "ai";
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
  text: z.string().min(1).max(4000),
  model: z.string().optional(),
  voice: z.string().optional(),
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
  const { sessionId, text, model, voice } = parse.data;

  const interview = await db.query.interviewSessions.findFirst({
    where: eq(interviewSessions.id, sessionId),
  });

  if (!interview || interview.userId !== session.user.id) {
    return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
  }

  if (interview.voiceEngine !== "openai") {
    return NextResponse.json(
      { error: "This session uses the in-browser voice engine; server-side TTS is not used." },
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

  // Accept a body override, then fall back to settings, but only when the value
  // is actually a valid OpenAI TTS model/voice — never a stale engine value.
  const ttsModel =
    model && voiceConfig.ttsModels.some((m) => m.id === model)
      ? model
      : settings.ttsModel && voiceConfig.ttsModels.some((m) => m.id === settings.ttsModel)
        ? settings.ttsModel
        : voiceConfig.defaultTtsModel;
  const selectedVoice =
    voice && voiceConfig.voices.some((v) => v.id === voice)
      ? voice
      : settings.ttsVoice && voiceConfig.voices.some((v) => v.id === settings.ttsVoice)
        ? settings.ttsVoice
        : voiceConfig.defaultVoice;

  const openai = createOpenAI({ apiKey });
  const { audio } = await generateSpeech({
    model: openai.speech(ttsModel),
    text,
    voice: selectedVoice,
  });

  return NextResponse.json({
    audioBase64: audio.base64,
    mediaType: "audio/mpeg",
  });
}