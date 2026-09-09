"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MagicWand01Icon } from "@/components/ui/magic-wand-01";
import { RefreshIcon } from "@/components/ui/refresh";
import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_DURATIONS,
  VOICE_ENGINES,
  enginesForProvider,
  INTERVIEW_NOT_SUPPORTED_BANNER,
  type Difficulty,
  type VoiceEngine,
} from "@/lib/interview-models";
import {
  generateInterviewConfig,
  generateSeed,
  type InterviewConfig,
} from "@/lib/interview-config";

interface Settings {
  provider: string;
  model: string | null;
  voiceEngine: string | null;
  interviewerModel: string | null;
}

export function InterviewSetup() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jd, setJd] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [seed, setSeed] = useState("");
  const [randomized, setRandomized] = useState(false);
  const [voiceEngine, setVoiceEngine] = useState<VoiceEngine | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/settings/ai-provider");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        const provider = data.settings.provider as "openai" | "google";
        const available = enginesForProvider(provider);
        const engine = (data.settings.voiceEngine as VoiceEngine) || available[0];
        setVoiceEngine(available.includes(engine) ? engine : available[0]);
      }
    } finally {
      setLoading(false);
    }
  }

  const provider = (settings?.provider as "openai" | "google") || "openai";
  const availableEngines = enginesForProvider(provider);
  const effectiveEngine: VoiceEngine | null =
    voiceEngine && availableEngines.includes(voiceEngine) ? voiceEngine : null;

  const config: InterviewConfig | null = useMemo(() => {
    if (!jd.trim()) return null;
    return generateInterviewConfig({
      seed: seed || "seed",
      jd,
      difficulty,
      durationMinutes,
    });
  }, [seed, jd, difficulty, durationMinutes]);

  function handleRandomize() {
    setSeed(generateSeed());
    setRandomized(true);
  }

  async function handleStart() {
    if (!effectiveEngine) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jd,
          difficulty,
          durationMinutes,
          seed: seed || undefined,
          voiceEngine: effectiveEngine,
          interviewerModel: settings?.interviewerModel || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.redirect) {
          router.push(data.redirect);
          return;
        }
        throw new Error(data.error || "Failed to start interview");
      }

      const data = await res.json();
      router.push(`/interview/session/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="flex items-center justify-center gap-2 text-center text-muted-foreground">
            <RefreshIcon size={16} className="animate-spin" />
            Loading...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Before your first mock interview</CardTitle>
          <CardDescription>
            Configure your own API key to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {INTERVIEW_NOT_SUPPORTED_BANNER}
          </p>
          <Button onClick={() => router.push("/settings")}>
            Go to Settings
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Create Mock Interview World</CardTitle>
        <CardDescription>
          Configure your interview like a Minecraft world — pick your settings,
          set a seed (or randomize), and generate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {provider === "google" && (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-600">
            {INTERVIEW_NOT_SUPPORTED_BANNER}
          </p>
        )}

        <div className="space-y-2">
          <label htmlFor="jd" className="text-sm font-medium">
            Job Description
          </label>
          <Textarea
            id="jd"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description you're preparing for..."
            rows={6}
            className="resize-y"
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Difficulty</span>
          <div className="flex flex-wrap gap-2">
            {INTERVIEW_DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  difficulty === d.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {INTERVIEW_DIFFICULTIES.find((d) => d.id === difficulty)?.description}
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Duration (minutes)</span>
          <div className="flex flex-wrap gap-2">
            {INTERVIEW_DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurationMinutes(d)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  durationMinutes === d
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Interviewer Voice</span>
          <div className="flex flex-wrap gap-2">
            {availableEngines.map((eng) => (
              <button
                key={eng}
                type="button"
                onClick={() => setVoiceEngine(eng)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  effectiveEngine === eng
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {VOICE_ENGINES[eng].label}
              </button>
            ))}
          </div>
          {effectiveEngine && (
            <p className="text-xs text-muted-foreground">
              {VOICE_ENGINES[effectiveEngine].description}
            </p>
          )}
        </div>

        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1 space-y-2">
              <label htmlFor="seed" className="text-sm font-medium">
                Seed
              </label>
              <input
                id="seed"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="random"
                className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={handleRandomize}
              title="Randomize seed"
            >
              <MagicWand01Icon size={16} className="shrink-0" />
            </Button>
          </div>

          {config ? (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{config.title}</p>
                <span className="text-xs text-muted-foreground capitalize">
                  {difficulty} · {durationMinutes} min
                </span>
              </div>
              <p className="text-muted-foreground">{config.interviewerPersona}</p>
              <div className="grid gap-1 sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Tone:</span>{" "}
                  {config.tone}
                </p>
                <p>
                  <span className="text-muted-foreground">Pace:</span>{" "}
                  {config.pace} · Follow-up depth: {config.followUpDepth}
                </p>
                <p>
                  <span className="text-muted-foreground">Questions:</span> ~
                  {config.questionCount}
                </p>
                <p>
                  <span className="text-muted-foreground">Areas:</span>{" "}
                  {config.focusAreas.join(", ")}
                </p>
              </div>
              {randomized && (
                <p className="text-xs text-muted-foreground">
                  Random seed used — this config is deterministic for this seed.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Paste a job description to preview your generated interview world.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end">
          <Button
            onClick={handleStart}
            disabled={creating || !jd.trim() || !effectiveEngine}
          >
            {creating ? "Generating world..." : "Start Interview"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}