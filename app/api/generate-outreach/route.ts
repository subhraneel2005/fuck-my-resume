import { NextRequest, NextResponse } from "next/server";
import { generateOutreach } from "@/lib/outreach-generator";
import type { Resume } from "@/lib/schemas/resume";

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription } = await request.json();

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: "resume and jobDescription are required" },
        { status: 400 }
      );
    }

    const outreach = await generateOutreach(resume as Resume, jobDescription);

    return NextResponse.json({ outreach });
  } catch (error) {
    console.error("Generate outreach error:", error);
    return NextResponse.json(
      { error: "Failed to generate outreach content" },
      { status: 500 }
    );
  }
}
