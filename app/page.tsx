"use client"

import { useState, useRef } from "react"
import { FaGithub, FaFilePdf, FaUpload } from "react-icons/fa"
import { FiCheck } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
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

const steps = [1, 2, 3]

export default function Page() {
  const [currentStep, setCurrentStep] = useState(1)
  const [fileName, setFileName] = useState<string | null>(null)
  const [jd, setJd] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFileName(file.name)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <Stepper
          value={currentStep}
          onValueChange={setCurrentStep}
          className="space-y-6"
        >
          <StepperNav className="justify-center px-6 pt-6">
            {steps.map((step) => (
              <StepperItem key={step} step={step}>
                <StepperTrigger>
                  <StepperIndicator>
                    {currentStep > step ? (
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
                <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
                  <FaGithub className="size-10 text-muted-foreground" />
                  <div className="space-y-1">
                    <CardTitle>Connect your account</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Sign in with GitHub to get started.
                    </p>
                  </div>
                  <Button size="lg" className="gap-2">
                    <FaGithub className="size-4" />
                    Continue with GitHub
                  </Button>
                </div>
              </CardContent>
            </StepperContent>

            <StepperContent value={2}>
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {fileName ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                        <FaFilePdf className="size-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium">{fileName}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFileName(null)
                          if (fileInputRef.current)
                            fileInputRef.current.value = ""
                        }}
                      >
                        Choose a different file
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border p-8 transition-colors hover:border-muted-foreground/30 hover:bg-muted/50"
                    >
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                        <FaUpload className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Upload your resume</p>
                        <p className="text-xs text-muted-foreground">
                          PDF up to 5MB
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </CardContent>
            </StepperContent>

            <StepperContent value={3}>
              <CardContent>
                <div className="flex flex-col gap-3 py-2">
                  <div className="space-y-1">
                    <CardTitle>Paste the job description</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll tailor your resume to match.
                    </p>
                  </div>
                  <Textarea
                    placeholder="Paste the full job description here..."
                    className="min-h-[160px]"
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                  />
                </div>
              </CardContent>
            </StepperContent>
          </StepperPanel>

          <CardFooter className="justify-between border-t px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={currentStep === 3}
            >
              Next
            </Button>
          </CardFooter>
        </Stepper>
      </Card>
    </div>
  )
}
