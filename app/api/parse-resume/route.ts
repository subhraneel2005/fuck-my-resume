import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { parseResumeWithLLM } from "@/lib/llm";
import { buildHighlights } from "@/lib/highlights";
import { describeLlmError } from "@/lib/llm-errors";
import { DEFAULT_BRAIN_MODEL, type Provider } from "@/lib/interview-models";

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up user's BYOK provider settings
    const settings = await db.query.aiSettings.findFirst({
      where: eq(aiSettings.userId, session.user.id),
    });

    if (!settings) {
      console.error(
        `parse-resume 403: no ai_settings row for user ${session.user.id} ` +
          `(email: ${session.user.email ?? "?"})`
      );
      return NextResponse.json(
        {
          error: "AI provider not configured",
          redirect: "/settings",
          hint: `Signed in as ${session.user.email ?? "unknown"}. Your API key may be saved under a different account.`,
        },
        { status: 403 }
      );
    }

    const provider = settings.provider as Provider;
    const apiKey = decrypt(settings.apiKey);
    const modelId = settings.model || DEFAULT_BRAIN_MODEL[provider];

    const body = await request.json();
    const { resumeText, jobDescription } = body;

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "resumeText is required" },
        { status: 400 }
      );
    }

    const { resume, aiChanges } = await parseResumeWithLLM(
      resumeText,
      jobDescription || undefined,
      provider,
      apiKey,
      modelId
    );

    const highlights = buildHighlights(
      aiChanges,
      resume,
      resumeText,
      jobDescription || undefined
    );

    return NextResponse.json({ resume, aiChanges, highlights });
  } catch (error) {
    console.error("Parse resume error:", error);
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
