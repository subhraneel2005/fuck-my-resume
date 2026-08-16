"use client"

import { useUser } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b bg-background/80 px-6 py-3 backdrop-blur-sm">
      <span className="text-sm font-semibold">fuck this resume</span>
      {isSignedIn ? (
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      ) : (
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      )}
    </nav>
  )
}
