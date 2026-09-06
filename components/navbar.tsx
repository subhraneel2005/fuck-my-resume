"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Navbar() {
  const { data: session } = authClient.useSession();

  const handleSignOut = () => {
    authClient.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-background/80 px-6 py-3 backdrop-blur-sm">
      {session ? (
        <div className="flex items-center gap-3">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      ) : (
        <Button variant={"ghost"} size="sm" onClick={() => window.location.href = "/sign-in"}>
          Sign In
        </Button>
      )}
    </nav>
  );
}
