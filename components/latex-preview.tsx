"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FaDownload, FaCopy, FaCheck, FaSpinner } from "react-icons/fa"
import { ResumePreview } from "@/components/resume-preview"
import type { Resume } from "@/lib/schemas/resume"
import type { Highlights } from "@/lib/highlights"

interface LaTeXPreviewProps {
  latexCode: string
  resumeData: Resume
  highlights?: Highlights | null
}

export function LaTeXPreview({
  latexCode,
  resumeData,
  highlights,
}: LaTeXPreviewProps) {
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(latexCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex: latexCode }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || "Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "resume.pdf"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("PDF generation failed:", err)
      alert(err instanceof Error ? err.message : "Failed to generate PDF. Try downloading the .tex file instead.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Generated Resume</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <FaCheck className="mr-2 size-3" />
            ) : (
              <FaCopy className="mr-2 size-3" />
            )}
            {copied ? "Copied!" : "Copy LaTeX"}
          </Button>
          <Button size="sm" onClick={handleDownloadPDF} disabled={isDownloading}>
            {isDownloading ? (
              <FaSpinner className="mr-2 size-3 animate-spin" />
            ) : (
              <FaDownload className="mr-2 size-3" />
            )}
            {isDownloading ? "Compiling..." : "Download PDF"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview">
          <TabsList className="w-full">
            <TabsTrigger value="preview" className="flex-1">
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="flex-1">
              LaTeX Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <div className="rounded-md border overflow-auto max-h-[700px]">
              <ResumePreview resume={resumeData} highlights={highlights} />
            </div>
          </TabsContent>
          <TabsContent value="code">
            <ScrollArea className="h-[500px] rounded-md border bg-muted/30 p-4">
              <pre className="text-xs leading-relaxed">
                <code>{latexCode}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
