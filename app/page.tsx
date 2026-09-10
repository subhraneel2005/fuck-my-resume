"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import type { ReactPlayerProps } from "react-player/types"
import { authClient } from "@/lib/auth-client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"

const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
}) as React.ComponentType<ReactPlayerProps>

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

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <Link href="/generate">
            <Button size="lg" className="h-14 px-10 text-lg leading-tighter font-bold">
              {session ? "Open the app" : "Get started — it's free"}
            </Button>
          </Link>
          <a
            href="https://www.producthunt.com/products/fuck-my-resume?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-fuck-my-resume"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="Fuck My Resume - Your resume is shit. We fix that. | Product Hunt"
              width="250"
              height="54"
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1246942&theme=light&t=1789064712572"
            />
          </a>
        </div>

        <div className="mt-20 w-full max-w-3xl overflow-hidden rounded-xl border shadow-sm">
          <div className="aspect-video">
            <ReactPlayer
              src="https://youtu.be/I9sEfhTnWJw"
              width="100%"
              height="100%"
              controls
            />
          </div>
        </div>

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
