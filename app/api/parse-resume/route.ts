import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { parseResumeWithLLM } from "@/lib/llm";
import { buildHighlights } from "@/lib/highlights";

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up user's Google API key
    const settings = await db.query.aiSettings.findFirst({
      where: eq(aiSettings.userId, session.user.id),
    });

    if (!settings || settings.provider !== "google") {
      return NextResponse.json(
        {
          error: "Google API key not configured",
          redirect: "/settings",
        },
        { status: 403 }
      );
    }

    const googleApiKey = decrypt(settings.apiKey);

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
      googleApiKey
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
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    );
  }
}
