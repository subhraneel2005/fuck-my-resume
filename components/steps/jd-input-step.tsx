"use client"

import { CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface JDInputStep {
  value: string
  onChange: (value: string) => void
}

export function JDInputStep({ value, onChange }: JDInputStep) {
  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="space-y-1">
        <CardTitle>Paste the job description</CardTitle>
        <p className="text-sm text-muted-foreground">
          We&apos;ll tailor your resume to match.
        </p>
      </div>
      <Textarea
        placeholder="Paste the full job description here..."
        className="h-[160px] resize-none overflow-y-auto"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
