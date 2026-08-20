import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, readFile } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const { latex } = await request.json();

    if (!latex || typeof latex !== "string") {
      return NextResponse.json(
        { error: "latex code is required" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const tmpDir = tmpdir();
    const texPath = join(tmpDir, `${id}.tex`);
    const pdfPath = join(tmpDir, `${id}.pdf`);

    await writeFile(texPath, latex);

    try {
      await execAsync(
        `tectonic "${texPath}" --outdir "${tmpDir}"`,
        { timeout: 120000 }
      );

      const pdfBuffer = await readFile(pdfPath);

      // Cleanup
      await Promise.all([
        unlink(texPath).catch(() => {}),
        unlink(pdfPath).catch(() => {}),
        unlink(join(tmpDir, `${id}.aux`)).catch(() => {}),
        unlink(join(tmpDir, `${id}.log`)).catch(() => {}),
        unlink(join(tmpDir, `${id}.out`)).catch(() => {}),
      ]);

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="resume.pdf"`,
        },
      });
    } catch (compileErr) {
      console.error("LaTeX compilation error:", compileErr);
      await unlink(texPath).catch(() => {});

      return NextResponse.json(
        {
          error: "LaTeX compilation failed",
          message: "Failed to compile the resume. Please try downloading the .tex file.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
