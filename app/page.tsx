"use client"

import { useState, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { FiCheck } from "react-icons/fi"
import { FaSpinner } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTrigger,
} from "@/components/reui/stepper"
import { Navbar } from "@/components/navbar"
import { AuthStep } from "@/components/steps/auth-step"
import { ResumeUploadStep } from "@/components/steps/resume-upload-step"
import { JDInputStep } from "@/components/steps/jd-input-step"
import { LaTeXPreview } from "@/components/latex-preview"
import { OutreachPreview } from "@/components/outreach-preview"
import { extractTextFromPDF, extractContactLinksFromPDF } from "@/lib/pdf-parser"
import { generateLatex } from "@/lib/latex-renderer"
import { renderColdEmail, renderColdDM } from "@/lib/template-renderer"
import type { Resume } from "@/lib/schemas/resume"
import type { Highlights } from "@/lib/highlights"
import type { ColdEmail, ColdDM } from "@/lib/schemas/outreach"

const steps = [1, 2, 3]

export default function Page() {
  const { isSignedIn } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [jd, setJd] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [latexCode, setLatexCode] = useState<string | null>(null)
  const [resumeData, setResumeData] = useState<Resume | null>(null)
  const [highlights, setHighlights] = useState<Highlights | null>(null)
  const [coldEmail, setColdEmail] = useState<string | null>(null)
  const [coldDM, setColdDM] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const effectiveStep = isSignedIn ? Math.max(currentStep, 2) : currentStep

  const handleFileSelect = useCallback((file: File) => {
    setResumeFile(file)
    setError(null)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!resumeFile) return

    setIsProcessing(true)
    setError(null)

    try {
      // Step 1: Extract text from PDF (client-side)
      const resumeText = await extractTextFromPDF(resumeFile)

      if (!resumeText.trim()) {
        throw new Error("Could not extract text from PDF. Please try another file.")
      }

      // Step 2: Send to LLM for structured parsing
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: jd || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to parse resume")
      }

      const { resume, highlights } = await response.json()

      // The PDF's real hyperlink targets (link annotations) may differ from the
      // displayed text; use them so the tailored resume links to the true URL.
      const pdfLinks = await extractContactLinksFromPDF(resumeFile)
      if (pdfLinks.linkedin || pdfLinks.github) {
        resume.contact = {
          ...resume.contact,
          linkedin: pdfLinks.linkedin || resume.contact.linkedin,
          github: pdfLinks.github || resume.contact.github,
        }
      }

      setResumeData(resume)
      setHighlights(highlights || null)

      // Step 3: Generate LaTeX
      const latex = generateLatex(resume)
      setLatexCode(latex)

      // Step 4: Generate outreach (if JD provided)
      if (jd.trim()) {
        try {
          const outreachResponse = await fetch("/api/generate-outreach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resume, jobDescription: jd }),
          })

          if (outreachResponse.ok) {
            const { outreach } = await outreachResponse.json()
            const emailData: ColdEmail = outreach.coldEmail
            const dmData: ColdDM = outreach.coldDM
            setColdEmail(renderColdEmail(emailData))
            setColdDM(renderColdDM(dmData))
          }
        } catch {
          // Outreach generation is optional, don't block resume
          console.error("Outreach generation failed")
        }
      }

      // Move to result view
      setCurrentStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsProcessing(false)
    }
  }, [resumeFile, jd])

  const handleDownloadTeX = useCallback(() => {
    if (!latexCode) return

    const blob = new Blob([latexCode], { type: "application/x-tex" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "resume.tex"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [latexCode])

  const handleBackToEdit = useCallback(() => {
    setCurrentStep(3)
    setLatexCode(null)
    setColdEmail(null)
    setColdDM(null)
    setHighlights(null)
  }, [])

  // Result view
  if (currentStep === 4 && latexCode && resumeData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 pt-16">
        <Navbar />
        <div className="w-full max-w-3xl space-y-4">
          <LaTeXPreview
            latexCode={latexCode}
            resumeData={resumeData}
            highlights={highlights}
          />
          {coldEmail && coldDM && (
            <OutreachPreview email={coldEmail} dm={coldDM} />
          )}
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={handleBackToEdit}>
              Back to Edit
            </Button>
            <Button variant="outline" onClick={handleDownloadTeX}>
              Download .tex
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 pt-16">
      <Navbar />
      <Card className="w-full max-w-lg">
        <Stepper
          value={effectiveStep}
          onValueChange={setCurrentStep}
          className="space-y-6"
        >
          <StepperNav className="justify-center px-6 pt-6">
            {steps.map((step) => (
              <StepperItem key={step} step={step}>
                <StepperTrigger>
                  <StepperIndicator>
                    {effectiveStep > step ? (
                      <FiCheck className="size-4" />
                    ) : (
                      step
                    )}
                  </StepperIndicator>
                </StepperTrigger>
                {steps.length > step && <StepperSeparator />}
              </StepperItem>
            ))}
          </StepperNav>

          <StepperPanel>
            <StepperContent value={1}>
              <CardContent>
                <AuthStep />
              </CardContent>
            </StepperContent>

            <StepperContent value={2}>
              <CardContent>
                <ResumeUploadStep onFileSelect={handleFileSelect} />
              </CardContent>
            </StepperContent>

            <StepperContent value={3}>
              <CardContent>
                <JDInputStep value={jd} onChange={setJd} />
              </CardContent>
            </StepperContent>
          </StepperPanel>

          <CardFooter className="justify-between border-t px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={effectiveStep <= 1 || isProcessing}
            >
              Back
            </Button>
            {effectiveStep < 3 ? (
              <Button
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={effectiveStep >= 3}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={!resumeFile || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="mr-2 size-3 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            )}
          </CardFooter>
        </Stepper>
        {error && (
          <div className="px-6 pb-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
