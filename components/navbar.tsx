"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { IoSettings } from "react-icons/io5";
import Link from "next/link";

export function Navbar() {
  const { data: session } = authClient.useSession();

  const handleSignOut = () => {
    authClient.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-background/80 px-6 py-3 backdrop-blur-sm">
      <Link href={"/"}>
      <span className="text-primary font-bold tracking-tighter text-sm">fuckmyresume.lol</span></Link>
      {session ? (
        <div className="flex items-center gap-2">
          <Link href="/interview">
            <Button variant="outline" size="sm">
              Mock Interview
            </Button>
          </Link>
          <Button
            variant="default"
            size="sm"
            onClick={() => (window.location.href = "/settings")}
          >
            AI Settings <IoSettings />

          </Button>
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (window.location.href = "/sign-in")}
        >
          Sign In
        </Button>
      )}
    </nav>
  );
}
