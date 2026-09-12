import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encrypt, decrypt, maskApiKey } from "@/lib/encryption";
import { randomUUID } from "crypto";
import {
  enginesForProvider,
  engineConfig,
  DEFAULT_BRAIN_MODEL,
  type Provider,
  type VoiceEngine,
} from "@/lib/interview-models";
import { validateProviderKey } from "@/lib/key-validation";

async function getSession(request: NextRequest) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

// GET — list user's AI provider settings
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.query.aiSettings.findFirst({
    where: eq(aiSettings.userId, session.user.id),
  });

  if (!settings) {
    return NextResponse.json({ settings: null });
  }

  return NextResponse.json({
    settings: {
      id: settings.id,
      provider: settings.provider,
      model: settings.model,
      apiKeyMasked: maskApiKey(decrypt(settings.apiKey)),
      voiceEngine: settings.voiceEngine,
      interviewerModel: settings.interviewerModel,
      sttModel: settings.sttModel,
      ttsModel: settings.ttsModel,
      ttsVoice: settings.ttsVoice,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    },
  });
}

// POST — create or update AI provider settings
export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    provider,
    apiKey,
    model,
    voiceEngine,
    interviewerModel,
    sttModel,
    ttsModel,
    ttsVoice,
  } = body;

  const existing = await db.query.aiSettings.findFirst({
    where: eq(aiSettings.userId, session.user.id),
  });

  if (!provider && !existing) {
    return NextResponse.json(
      { error: "provider and apiKey are required" },
      { status: 400 }
    );
  }

  const resolvedProvider: Provider = provider || (existing!.provider as Provider);

  if (resolvedProvider !== "openai" && resolvedProvider !== "google") {
    return NextResponse.json(
      { error: "provider must be 'openai' or 'google'" },
      { status: 400 }
    );
  }

  // Keep existing key when not re-entered (matches "leave blank to keep current")
  let resolvedApiKey: string | undefined;
  const newKeyProvided =
    typeof apiKey === "string" && apiKey.trim().length > 0;
  if (newKeyProvided) {
    resolvedApiKey = apiKey.trim();
  } else if (existing) {
    resolvedApiKey = decrypt(existing.apiKey);
  }

  if (!resolvedApiKey) {
    return NextResponse.json(
      { error: "provider and apiKey are required" },
      { status: 400 }
    );
  }

  // Validate a newly-entered key against the provider before persisting it, so
  // bad keys never land in the DB and users get instant feedback.
  if (newKeyProvided) {
    const validation = await validateProviderKey(resolvedProvider, resolvedApiKey);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message, code: validation.code },
        { status: 400 }
      );
    }
  }

  // Validate voice engine against the provider (Google can only use browser voice).
  let resolvedVoiceEngine: VoiceEngine | null =
    voiceEngine && voiceEngine !== "auto" ? (voiceEngine as VoiceEngine) : null;

  if (resolvedVoiceEngine && !enginesForProvider(resolvedProvider).includes(resolvedVoiceEngine)) {
    return NextResponse.json(
      { error: `Voice engine '${resolvedVoiceEngine}' is not available for provider '${resolvedProvider}'` },
      { status: 400 }
    );
  }

  const defaultEngine = enginesForProvider(resolvedProvider)[0] ?? "browser";
  const effectiveEngine: VoiceEngine = resolvedVoiceEngine || defaultEngine;
  const voiceConfig = engineConfig(effectiveEngine);

  const resolvedInterviewerModel =
    interviewerModel || existing?.interviewerModel || DEFAULT_BRAIN_MODEL[resolvedProvider];

  // Only persist STT/TTS model + voice values that are valid for the selected
  // engine. Stale values from a previously-selected engine (e.g. kokoro models
  // after switching OpenAI→free voice) get replaced with the engine defaults.
  const validStt = (v: string | null | undefined) =>
    typeof v === "string" && voiceConfig.sttModels.some((m) => m.id === v);
  const validTts = (v: string | null | undefined) =>
    typeof v === "string" && voiceConfig.ttsModels.some((m) => m.id === v);
  const validVoice = (v: string | null | undefined) =>
    typeof v === "string" && voiceConfig.voices.some((m) => m.id === v);

  const candidateStt = sttModel ?? existing?.sttModel;
  const candidateTts = ttsModel ?? existing?.ttsModel;
  const candidateVoice = ttsVoice ?? existing?.ttsVoice;

  const resolvedSttModel = validStt(candidateStt) ? candidateStt! : voiceConfig.defaultSttModel;
  const resolvedTtsModel = validTts(candidateTts) ? candidateTts! : voiceConfig.defaultTtsModel;
  const resolvedTtsVoice = validVoice(candidateVoice) ? candidateVoice! : voiceConfig.defaultVoice;

  const values = {
    provider: resolvedProvider,
    apiKey: encrypt(resolvedApiKey),
    model: typeof model === "string" && model.trim() ? model : null,
    voiceEngine: effectiveEngine,
    interviewerModel: resolvedInterviewerModel,
    sttModel: resolvedSttModel,
    ttsModel: resolvedTtsModel,
    ttsVoice: resolvedTtsVoice,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(aiSettings)
      .set(values)
      .where(eq(aiSettings.userId, session.user.id));
  } else {
    await db.insert(aiSettings).values({
      id: randomUUID(),
      userId: session.user.id,
      ...values,
    });
  }

  return NextResponse.json({ success: true, voiceEngine: effectiveEngine });
}

// DELETE — remove AI provider settings
export async function DELETE(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.delete(aiSettings).where(eq(aiSettings.userId, session.user.id));

  return NextResponse.json({ success: true });
}