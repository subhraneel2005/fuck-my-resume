import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt, migrateApiKeyIfLegacy } from "@/lib/encryption";
import { generateOutreach } from "@/lib/outreach-generator";
import { describeLlmError } from "@/lib/llm-errors";
import { DEFAULT_BRAIN_MODEL, type Provider } from "@/lib/interview-models";
import type { Resume } from "@/lib/schemas/resume";

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up user's AI provider settings
    const settings = await db.query.aiSettings.findFirst({
      where: eq(aiSettings.userId, session.user.id),
    });

    if (!settings) {
      return NextResponse.json(
        {
          error: "AI provider not configured",
          redirect: "/settings",
        },
        { status: 403 }
      );
    }

    const provider = settings.provider as Provider;
    const apiKey = decrypt(settings.apiKey);

    const migrated = migrateApiKeyIfLegacy(settings.apiKey);
    if (migrated) {
      await db
        .update(aiSettings)
        .set({ apiKey: migrated, updatedAt: new Date() })
        .where(eq(aiSettings.userId, session.user.id));
    }

    const modelId = settings.model || DEFAULT_BRAIN_MODEL[provider];

    const { resume, jobDescription } = await request.json();

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: "resume and jobDescription are required" },
        { status: 400 }
      );
    }

    const outreach = await generateOutreach(
      resume as Resume,
      jobDescription,
      provider,
      apiKey,
      modelId
    );

    return NextResponse.json({ outreach });
  } catch (error) {
    console.error("Generate outreach error:", error);
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
