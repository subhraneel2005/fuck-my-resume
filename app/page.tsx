"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"

export default function Page() {
  const { data: session } = authClient.useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.replace("/generate")
    }
  }, [session, router])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex flex-1 flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <Image
          src="/applogo.png"
          alt="fuckmyresume.lol"
          width={64}
          height={64}
          className="mb-8 size-16 rounded-2xl"
        />

        <h1 className="max-w-2xl text-5xl leading-tighter font-black tracking-tight sm:text-6xl lg:text-7xl">
          Your resume is shit💩
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground leading-tighter">
          We fix that. AI-tailored resumes, cold outreach drafts, and mock interviews — all in one place.
        </p>

        <Link href="/generate" className="mt-10">
          <Button size="lg" className="h-14 px-10 text-lg leading-tighter font-bold">
            {session ? "Open the app" : "Get started — it's free"}
          </Button>
        </Link>

        <div className="mt-20 grid max-w-3xl gap-8 sm:grid-cols-3">
          <Feature title="Resume Tailoring" desc="AI rewrites your resume to match any job description in seconds." />
          <Feature title="Cold Outreach" desc="Auto-generated emails and LinkedIn DMs that actually get replies." />
          <Feature title="Mock Interviews" desc="AI interviewer that scores you and tells you exactly where you suck." />
        </div>

        <p className="mt-16 text-xs text-muted-foreground">
          BYOK — bring your own API key. Your data stays yours.
        </p>
      </main>
    </div>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-base leading-tighter font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}
