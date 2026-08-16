"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { FiCheck } from "react-icons/fi"
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

const steps = [1, 2, 3]

export default function Page() {
  const { isSignedIn } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [jd, setJd] = useState("")

  const effectiveStep = isSignedIn ? Math.max(currentStep, 2) : currentStep

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
                <ResumeUploadStep onFileSelect={() => {}} />
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
              disabled={effectiveStep <= 1}
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={effectiveStep >= 3}
            >
              Next
            </Button>
          </CardFooter>
        </Stepper>
      </Card>
    </div>
  )
}
