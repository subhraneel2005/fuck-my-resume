import { NextRequest, NextResponse } from "next/server";
import { parseResumeWithLLM } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription } = body;

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "resumeText is required" },
        { status: 400 }
      );
    }

    const resume = await parseResumeWithLLM(
      resumeText,
      jobDescription || undefined
    );

    return NextResponse.json({ resume });
  } catch (error) {
    console.error("Parse resume error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    );
  }
}
