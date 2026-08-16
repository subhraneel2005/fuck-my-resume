"use client"

import dynamic from "next/dynamic"

const SignIn = dynamic(
  () => import("@clerk/nextjs").then((m) => m.SignIn),
  { ssr: false }
)

export function AuthStep() {
  return (
    <div className="flex justify-center py-2">
      <SignIn routing="hash" />
    </div>
  )
}
