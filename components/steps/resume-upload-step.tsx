"use client"

import { useRef, useState } from "react"
import { FaFilePdf, FaUpload } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"

interface ResumeUploadStep {
  onFileSelect: (file: File) => void
}

export function ResumeUploadStep({ onFileSelect }: ResumeUploadStep) {
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileSelect(file)
    }
  }

  return (
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
              if (fileInputRef.current) fileInputRef.current.value = ""
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
            <p className="text-xs text-muted-foreground">PDF up to 5MB</p>
          </div>
        </button>
      )}
    </div>
  )
}
