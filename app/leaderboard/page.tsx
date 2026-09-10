"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/components/ui/refresh";
import { DashboardSquare01Icon } from "@/components/ui/dashboard-square-01";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  avgScore: number;
  interviews: number;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  viewerId: string | null;
  generatedAt: number;
}

const POLL_INTERVAL = 30_000;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load leaderboard");
      const json: LeaderboardData = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 pt-24 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <DashboardSquare01Icon size={24} className="text-primary" />
              Hall of Fame
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranked by average interview score, then number of interviews.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshIcon size={14} className="mr-1.5 shrink-0" />
            Refresh
          </Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-500">
            Couldn&apos;t load the leaderboard. {error}
          </p>
        )}

        {loading && !data ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-4 rounded-lg border bg-card p-3"
              >
                <div className="size-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-muted" />
                  <div className="h-3 w-1/5 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {data?.entries.length === 0 && (
              <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
                No completions yet. Be the first to land a job.
              </div>
            )}
            {data?.entries.map((entry) => {
              const isViewer = entry.userId === data.viewerId;
const medal =
    "data:image/svg+xml;base64," +
    btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M9 9V4l6 3V4l-6 3z"/></svg>`
    );

  return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 rounded-lg border p-3 ${
                    entry.rank === 1
                      ? "bg-primary/5"
                      : isViewer
                        ? "bg-primary/10 ring-1 ring-primary"
                        : "bg-card"
                  }`}
                >
                  <div className="flex w-10 shrink-0 justify-center">
                    {entry.rank <= 3 ? (
                      <Image
                        src={
                          entry.rank === 1
                            ? "/first-badge.png"
                            : entry.rank === 2
                              ? "/second-badge.png"
                              : "/third-badge.png"
                        }
                        alt={`${entry.rank}${entry.rank === 1 ? "st" : entry.rank === 2 ? "nd" : "rd"} place`}
                        width={40}
                        height={40}
                        className="size-10 shrink-0 drop-shadow"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground">
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  {entry.image ? (
                    <Image
                      src={entry.image}
                      alt={entry.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {initials(entry.name)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {entry.name}
                      {isViewer && (
                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.interviews} interview{entry.interviews === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold tabular-nums text-primary">
                      {entry.avgScore.toFixed(1)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /10
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {data && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Auto-refreshes every 30s
          </p>
        )}
      </main>
    </div>
  );
}