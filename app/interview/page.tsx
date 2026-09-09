"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";
import { InterviewSetup } from "@/components/interview/interview-setup";

export default function InterviewPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    } else if (!isPending && session) {
      setReady(true);
    }
  }, [session, isPending, router]);

  if (isPending || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 pt-16">
      <Navbar />
      <InterviewSetup />
    </div>
  );
}