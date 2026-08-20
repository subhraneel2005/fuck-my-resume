"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { FaCopy, FaCheck, FaEnvelope, FaLinkedin } from "react-icons/fa"

interface OutreachPreviewProps {
  email: string
  dm: string
}

export function OutreachPreview({ email, dm }: OutreachPreviewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Outreach Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email">
          <TabsList className="w-full">
            <TabsTrigger value="email" className="flex-1">
              <FaEnvelope className="mr-2 size-3" />
              Cold Email
            </TabsTrigger>
            <TabsTrigger value="dm" className="flex-1">
              <FaLinkedin className="mr-2 size-3" />
              Cold DM
            </TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <div className="space-y-2">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(email, "email")}
                >
                  {copiedField === "email" ? (
                    <FaCheck className="mr-2 size-3" />
                  ) : (
                    <FaCopy className="mr-2 size-3" />
                  )}
                  {copiedField === "email" ? "Copied!" : "Copy"}
                </Button>
              </div>
              <ScrollArea className="h-[300px] rounded-md border bg-muted/30 p-4">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {email}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
          <TabsContent value="dm">
            <div className="space-y-2">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(dm, "dm")}
                >
                  {copiedField === "dm" ? (
                    <FaCheck className="mr-2 size-3" />
                  ) : (
                    <FaCopy className="mr-2 size-3" />
                  )}
                  {copiedField === "dm" ? "Copied!" : "Copy"}
                </Button>
              </div>
              <ScrollArea className="h-[300px] rounded-md border bg-muted/30 p-4">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {dm}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
