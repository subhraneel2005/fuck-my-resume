"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Robot01Icon } from "@/components/ui/robot-01";
import { File01Icon } from "@/components/ui/file-01";
import { Settings01Icon } from "@/components/ui/settings-01";
import { Login01Icon } from "@/components/ui/login-01";
import { Logout01Icon } from "@/components/ui/logout-01";
import { DashboardSquare01Icon } from "@/components/ui/dashboard-square-01";
import { Sun03Icon } from "@/components/ui/sun-03";
import { Moon02Icon } from "@/components/ui/moon-02";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun03Icon size={16} />
      ) : (
        <Moon02Icon size={16} />
      )}
    </Button>
  );
}

export function Navbar() {
  const { data: session } = authClient.useSession();

  const handleSignOut = () => {
    authClient.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-background/80 px-6 py-3 backdrop-blur-sm">
      <Link href={"/"} className="flex items-center">
        <Image
          src="/applogo.png"
          alt="fuckmyresume.lol"
          width={32}
          height={32}
          className="size-8 shrink-0"
        />
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/leaderboard">
          <Button variant="ghost" size="sm">
            <DashboardSquare01Icon size={14} className="mr-1.5 shrink-0" />
            Leaderboard
          </Button>
        </Link>
        <Link href="/generate">
          <Button size="sm">
            <File01Icon size={14} className="mr-1.5 shrink-0" />
            Generate
          </Button>
        </Link>
        {session ? (
        <div className="flex items-center gap-2">
          <Link href="/interview">
            <Button variant="outline" size="sm">
              <Robot01Icon size={14} className="mr-1.5 shrink-0" />
              Mock Interview
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/settings")}
          >
            AI Settings <Settings01Icon size={14} className="ml-1.5 shrink-0" />

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
            <Logout01Icon size={14} className="mr-1.5 shrink-0" />
            Sign Out
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (window.location.href = "/sign-in")}
        >
          <Login01Icon size={14} className="mr-1.5 shrink-0" />
          Sign In
        </Button>
      )}
      </div>
    </nav>
  );
}
