import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encrypt, decrypt, maskApiKey } from "@/lib/encryption";
import { randomUUID } from "crypto";

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
  const { provider, apiKey, model } = body;

  if (!provider || !apiKey) {
    return NextResponse.json(
      { error: "provider and apiKey are required" },
      { status: 400 }
    );
  }

  if (provider !== "openai" && provider !== "google") {
    return NextResponse.json(
      { error: "provider must be 'openai' or 'google'" },
      { status: 400 }
    );
  }

  const encryptedKey = encrypt(apiKey);

  // Check if settings already exist for this user
  const existing = await db.query.aiSettings.findFirst({
    where: eq(aiSettings.userId, session.user.id),
  });

  if (existing) {
    // Update existing
    await db
      .update(aiSettings)
      .set({
        provider,
        apiKey: encryptedKey,
        model: model || null,
        updatedAt: new Date(),
      })
      .where(eq(aiSettings.userId, session.user.id));
  } else {
    // Create new
    await db.insert(aiSettings).values({
      id: randomUUID(),
      userId: session.user.id,
      provider,
      apiKey: encryptedKey,
      model: model || null,
    });
  }

  return NextResponse.json({ success: true });
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
