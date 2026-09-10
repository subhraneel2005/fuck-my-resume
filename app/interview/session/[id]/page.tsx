"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Call02Icon } from "@/components/ui/call-02";
import { PauseIcon } from "@/components/ui/pause";
import { Logout01Icon } from "@/components/ui/logout-01";
import { DashboardSquare01Icon } from "@/components/ui/dashboard-square-01";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Persona, type PersonaState } from "@/components/ai-elements/persona";
import {
  createRecorder,
  stopRecorder,
  decodeToPCM16k,
  encodeWav,
  blobToBase64,
  playBase64Audio,
  type RecorderState,
} from "@/lib/audio";
import { VOICE_ENGINES, resolveTtsVoice } from "@/lib/interview-models";
import { loadBrowserKokoro, loadBrowserWhisper } from "@/lib/interview-browser-voice";
import {
  generateInterviewConfig,
  buildInterviewMarkdown,
  type InterviewConfig,
  type InterviewMessage,
} from "@/lib/interview-config";

interface SessionInfo {
  id: string;
  jobTitle: string | null;
  company: string | null;
  difficulty: string;
  durationMinutes: number;
  seed: string;
  config: InterviewConfig;
  voiceEngine: string;
  model: string;
  status: string;
}

interface Feedback {
  score?: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

type Status =
  | "loading"
  | "ready"
  | "starting"
  | "listening"
  | "recording"
  | "processing"
  | "assistant"
  | "waiting-gesture"
  | "completed";

const STORAGE_PREFIX = "fmr:interview:";
const GUIDE_KEY = `${STORAGE_PREFIX}guide-dismissed`;

function secondsToClock(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function InterviewSessionPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: session } = authClient.useSession();
  const [interview, setInterview] = useState<SessionInfo | null>(null);
  const [settings, setSettings] = useState<{
    ttsModel: string | null;
    ttsVoice: string | null;
    sttModel: string | null;
  } | null>(null);

  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [remaining, setRemaining] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelStage, setModelStage] = useState("");
  const [showCallGuide, setShowCallGuide] = useState(false);
  const [downloads, setDownloads] = useState<{
    voice?: { loaded: number; total: number };
    stt?: { loaded: number; total: number };
  } | null>(null);

  const recorderRef = useRef<RecorderState | null>(null);
  const messagesRef = useRef<InterviewMessage[]>([]);
  const statusRef = useRef<Status>("loading");
  const startTimeRef = useRef<number | null>(null);
  const totalRef = useRef(0);
  const autoStartedRef = useRef(false);
  const pendingTextRef = useRef<string | null>(null);

  messagesRef.current = messages;
  statusRef.current = status;

  const engine = (interview?.voiceEngine as "openai" | "browser" | undefined) ||
    "openai";

  useEffect(() => {
    async function load() {
      const storageKey = `${STORAGE_PREFIX}${id}`;
      const stored = localStorage.getItem(storageKey);
      let resumed = false;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            resumed = true;
          }
        } catch {
          // ignore corrupt cache
        }
      }

      const [sessionRes, settingsRes] = await Promise.all([
        fetch(`/api/interview/session/${id}`),
        fetch("/api/settings/ai-provider"),
      ]);
      const sessionData = await sessionRes.json();
      if (!sessionData.session) {
        setError("Interview session not found.");
        setStatus("completed");
        return;
      }
      setInterview(sessionData.session);
      setRemaining(sessionData.session.durationMinutes * 60);
      totalRef.current = sessionData.session.durationMinutes * 60;

      const settingsData = await settingsRes.json();
      if (settingsData.settings) {
        setSettings({
          ttsModel: settingsData.settings.ttsModel,
          ttsVoice: settingsData.settings.ttsVoice,
          sttModel: settingsData.settings.sttModel,
        });
      }

      if (sessionData.session.status === "completed") {
        setFeedback(sessionData.session.feedback ?? null);
        setStatus("completed");
        return;
      }

      // Fresh interview → "ready" triggers the automatic greeting. A resumed
      // interview goes straight to listening (no re-speaking).
      setStatus(resumed ? "listening" : "ready");

      if (!resumed && localStorage.getItem(GUIDE_KEY) !== "1") {
        setShowCallGuide(true);
      }
    }
    void load();
  }, [id]);

  useEffect(() => {
    if (interview && !session) {
      window.location.href = "/sign-in";
    }
  }, [interview, session]);

  useEffect(() => {
    if (status === "completed") return;
    if (startTimeRef.current === null) {
      setRemaining(totalRef.current);
      return;
    }
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      const left = Math.max(0, totalRef.current - elapsed);
      setRemaining(left);
      if (left === 0) {
        clearInterval(timer);
        void completeInterview();
      }
    }, 500);
    return () => clearInterval(timer);
  }, [status]);

  const config = useMemo(
    () =>
      interview?.config ?? {
        ...generateInterviewConfig({
          seed: interview?.seed || "seed",
          jd: "",
          difficulty: "normal" as const,
          durationMinutes: 10,
        }),
      },
    [interview]
  );

  const persist = useCallback((msgs: InterviewMessage[]) => {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(msgs));
  }, [id]);

  function isAutoplayBlocked(err: unknown): boolean {
  if (err instanceof DOMException) {
    return err.name === "NotAllowedError" || err.name === "AbortError";
  }
  const msg = err instanceof Error ? err.message : "";
  return /autoplay|play\(\)|user gesture|interaction/i.test(msg);
}

  const speakText = useCallback(
    async (text: string): Promise<"played" | "blocked"> => {
      if (!text?.trim()) return "played";
      try {
        if (engine === "browser") {
          const { speakWithKokoro } = await import("@/lib/interview-browser-voice");
          const voice = resolveTtsVoice("browser", settings?.ttsVoice);
          await speakWithKokoro(text, voice, (stage) => {
            setModelStage(stage === "ready" ? "Synthesizing audio..." : `Downloading voice model... ${stage}`);
          });
        } else {
          const res = await fetch("/api/interview/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: id,
              text,
              model: settings?.ttsModel || undefined,
              voice: resolveTtsVoice("openai", settings?.ttsVoice),
            }),
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "TTS failed");
          }
          const data = await res.json();
          await playBase64Audio(data.audioBase64, data.mediaType);
        }
        return "played";
      } catch (err) {
        if (isAutoplayBlocked(err)) {
          pendingTextRef.current = text;
          setStatus("waiting-gesture");
          return "blocked";
        }
        throw err;
      }
    },
    [engine, id, settings]
  );

  const startInterview = useCallback(async () => {
    setStatus("starting");
    setError(null);
    setModelStage("");
    setDownloads(engine === "browser" ? {} : null);
    try {
      // Greet via the brain while the browser voice models download in
      // parallel — the interview clock only starts once both are ready.
      const chatResPromise = fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, messages: [] }),
      });

      let modelsPromise: Promise<unknown> = Promise.resolve();
      if (engine === "browser") {
        modelsPromise = Promise.all([
          loadBrowserKokoro((_stage, loaded, total) => {
            setDownloads((d) => ({ ...(d ?? {}), voice: { loaded, total } }));
          }).catch(() => {}),
          loadBrowserWhisper((_stage, loaded, total) => {
            setDownloads((d) => ({ ...(d ?? {}), stt: { loaded, total } }));
          }).catch(() => {}),
        ]);
      }

      const res = await chatResPromise;
      if (!res.ok) {
        const data = await res.json();
        if (data.redirect) {
          window.location.href = data.redirect;
          return;
        }
        throw new Error(data.error || "Failed to start interview");
      }
      const data = await res.json();
      const openingText = data.response ?? data.text ?? "";
      if (!openingText.trim()) throw new Error("Interviewer returned an empty greeting");
      const opening: InterviewMessage = { role: "assistant", content: openingText };
      const next = [...messagesRef.current, opening];
      setMessages(next);
      persist(next);

      // Don't start the clock while models are still downloading.
      await modelsPromise;
      setDownloads(null);

      startTimeRef.current = Date.now();
      setStatus("assistant");
      const result = await speakText(opening.content);
      if (result !== "blocked" && (statusRef.current as Status) !== "completed") {
        setStatus("listening");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDownloads(null);
      setStatus("ready");
    }
  }, [id, persist, speakText, engine]);

  // Auto-begin: as soon as a fresh interview has loaded, the interviewer greets
  // the candidate via TTS (no separate "Begin Interview" press).
  useEffect(() => {
    if (status !== "ready" || !interview || autoStartedRef.current) return;
    autoStartedRef.current = true;
    void startInterview();
  }, [status, interview, startInterview]);

  const handlePressStart = useCallback(async () => {
    if (statusRef.current !== "listening") return;
    setError(null);
    try {
      recorderRef.current = await createRecorder();
      recorderRef.current.mediaRecorder.start();
      setStatus("recording");
    } catch {
      setError("Microphone access denied. Check browser permissions.");
    }
  }, []);

  const handlePressEnd = useCallback(async () => {
    if (statusRef.current !== "recording" || !recorderRef.current) return;
    setStatus("processing");
    setModelStage("");
    try {
      const blob = await stopRecorder(recorderRef.current);
      recorderRef.current = null;
      if (blob.size === 0) {
        setStatus("listening");
        return;
      }

      const pcm = await decodeToPCM16k(blob);
      let text = "";

      if (engine === "browser") {
        const { transcribeWithWhisper } = await import("@/lib/interview-browser-voice");
        text = await transcribeWithWhisper(pcm, (stage) => {
          setModelStage(stage === "ready" ? "Transcribing..." : `Downloading speech model... ${stage}`);
        });
      } else {
        const wav = encodeWav(pcm, 16000);
        const audioBase64 = await blobToBase64(wav);
        const res = await fetch("/api/interview/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: id,
            audioBase64,
            model: settings?.sttModel || undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Transcription failed");
        }
        const data = await res.json();
        text = data.text;
      }

      text = text.trim();
      if (!text) {
        setStatus("listening");
        return;
      }

      const userMsg: InterviewMessage = { role: "user", content: text };
      const withUser = [...messagesRef.current, userMsg];
      setMessages(withUser);
      persist(withUser);

      setStatus("assistant");
      setModelStage("");
      const cleanForChat = withUser.filter((m) => m.content?.trim());
      const chatRes = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, messages: cleanForChat }),
      });
      if (!chatRes.ok) {
        const data = await chatRes.json();
        throw new Error(data.error || "Interviewer failed to respond");
      }
      const chatData = await chatRes.json();
      const assistantText = chatData.response ?? chatData.text ?? "";
      const assistantMsg: InterviewMessage = { role: "assistant", content: assistantText };
      const withAssistant = [...withUser, assistantMsg];
      setMessages(withAssistant);
      persist(withAssistant);

      const result = await speakText(assistantMsg.content);

      if (result !== "blocked" && (statusRef.current as Status) !== "completed") {
        setStatus("listening");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      recorderRef.current = null;
      if ((statusRef.current as Status) !== "completed") {
        setStatus("listening");
      }
    }
  }, [engine, id, persist, settings, speakText]);

  // Retry a blocked (autoplay-policy) playback once the user has tapped.
  const resumeSpeech = useCallback(async () => {
    const pending = pendingTextRef.current;
    pendingTextRef.current = null;
    if (!pending) {
      if ((statusRef.current as Status) !== "completed") setStatus("listening");
      return;
    }
    setError(null);
    setModelStage("");
    setStatus("assistant");
    try {
      const result = await speakText(pending);
      if (result === "blocked") {
        // still blocked — keep the tap-to-hear state, text is re-queued
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("listening");
      return;
    }
    if ((statusRef.current as Status) !== "completed") {
      setStatus("listening");
    }
  }, [speakText]);

  const dismissCallGuide = useCallback(() => {
    setShowCallGuide(false);
    localStorage.setItem(GUIDE_KEY, "1");
  }, []);

  // Push-to-talk: hold Space to record, release to submit — same as the mic.
  useEffect(() => {
    if (showCallGuide) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.code !== "Space" || statusRef.current !== "listening")
        return;
      e.preventDefault();
      void handlePressStart();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space" || statusRef.current !== "recording") return;
      e.preventDefault();
      void handlePressEnd();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handlePressStart, handlePressEnd, showCallGuide]);

  const completeInterview = useCallback(async () => {
    if (statusRef.current === "completed") return;
    setStatus("completed");
    const markdown = buildInterviewMarkdown(messagesRef.current);
    persist(messagesRef.current);
    try {
      const res = await fetch(`/api/interview/session/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptMarkdown: markdown }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
    } catch {
      // Feedback optional — results still shown
    }
  }, [id, persist]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading interview...</p>
      </div>
    );
  }

  const percent = remaining / totalRef.current;

  // The animated persona mirrors the interviewer's conversational state.
  const personaState: PersonaState =
    status === "assistant"
      ? "speaking"
      : status === "processing"
        ? "thinking"
        : status === "starting" || status === "ready"
          ? "thinking"
          : status === "listening" || status === "recording"
            ? "listening"
            : "idle";

  const personaHint =
    status === "waiting-gesture" ? null :
    status === "starting" || status === "ready"
      ? "The interviewer is introducing themselves and asking your first question..."
      : status === "listening"
        ? "Hold the mic button or press and hold Space to talk."
        : status === "recording"
          ? "Recording..."
          : status === "processing"
            ? modelStage || "Transcribing..."
            : status === "assistant"
              ? modelStage || "Interviewer is speaking..."
              : null;

  const userName = session?.user?.name || "You";
  const userInitial = (userName || "U").charAt(0).toUpperCase();
  const isPersonaSpeaking = status === "assistant";
  const isUserActive = status === "listening" || status === "recording";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-3 p-4 pt-16">
        {feedback ? (
          <InterviewResults feedback={feedback} transcript={buildInterviewMarkdown(messages)} config={config} />
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 px-1">
              <Button
                variant="outline"
                size="sm"
                onClick={completeInterview}
                disabled={status === "assistant"}
              >
                <Logout01Icon size={14} className="mr-1.5 shrink-0" />
                End Interview
              </Button>

              <div className="min-w-0 text-center">
                <p className="truncate text-sm font-semibold">{config.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {interview?.jobTitle && (
                    <span className="font-medium text-foreground">{interview.jobTitle}</span>
                  )}
                  {interview?.company && ` at ${interview.company}`}
                  {" · "}
                  {VOICE_ENGINES[engine]?.label ?? engine}
                  {" · "}
                  <span className="capitalize">{interview?.difficulty}</span>
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <p className={`font-mono text-lg tabular-nums ${remaining <= 30 ? "text-destructive" : ""}`}>
                  {secondsToClock(remaining)}
                </p>
                <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.max(0, Math.min(1, percent)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border bg-muted/30 p-6 transition-shadow ${
                  isUserActive ? "ring-2 ring-primary" : ""
                }`}
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={userName}
                    width={224}
                    height={224}
                    className="size-56 rounded-full object-cover ring-4 ring-background"
                  />
                ) : (
                  <div className="flex size-56 items-center justify-center rounded-full bg-primary/15 text-6xl font-semibold text-foreground ring-4 ring-background">
                    {userInitial}
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {status === "recording"
                      ? "Speaking..."
                      : status === "listening"
                        ? "Listening..."
                        : "You"}
                  </p>
                </div>
              </div>

              <div
                className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border bg-muted/30 p-6 transition-shadow ${
                  isPersonaSpeaking ? "ring-2 ring-primary" : ""
                }`}
              >
                <Persona state={personaState} className="size-56" />
                <div className="text-center">
                  <p className="text-sm font-medium">AI Interviewer</p>
                  <p className="text-xs text-muted-foreground">
                    {status === "assistant"
                      ? "Speaking..."
                      : status === "processing"
                        ? "Thinking..."
                        : "Idle"}
                  </p>
                </div>
              </div>
            </div>

            {status === "waiting-gesture" && (
              <div className="flex flex-col items-center gap-3 pb-2">
                <p className="text-sm text-muted-foreground">
                  {VOICE_ENGINES[engine]?.label ?? engine} needs a tap to play
                  audio. Tap below to hear the interviewer.
                </p>
                <Button size="sm" onClick={resumeSpeech}>
                  <Call02Icon size={16} className="mr-2 shrink-0" /> Tap to hear
                </Button>
              </div>
            )}

            <div className="flex flex-col items-center gap-2 pb-2">
              {downloads && (
                <div className="w-full max-w-sm space-y-2 text-xs">
                  <p className="text-center font-medium">
                    Preparing the interviewer — downloading voice models
                  </p>
                  {downloads.voice && (
                    <DownloadBar label="Interviewer voice model" {...downloads.voice} />
                  )}
                  {downloads.stt && (
                    <DownloadBar label="Speech recognition model" {...downloads.stt} />
                  )}
                </div>
              )}
              {["listening", "recording", "processing", "assistant"].includes(status) && (
                <button
                  type="button"
                  onPointerDown={handlePressStart}
                  onPointerUp={handlePressEnd}
                  onPointerLeave={handlePressEnd}
                  disabled={!["listening", "recording"].includes(status)}
                  className={`flex size-24 items-center justify-center rounded-full text-white shadow-lg transition-all ${
                    status === "recording"
                      ? "bg-destructive scale-105"
                      : "bg-primary hover:bg-primary/90 disabled:opacity-50"
                  }`}
                >
                  {status === "recording" ? <PauseIcon size={30} className="shrink-0" /> : <Call02Icon size={32} className="shrink-0" />}
                </button>
              )}
              <div className="min-h-5 text-center text-sm text-muted-foreground">
                {personaHint}
              </div>
            </div>
          </>
        )}

        {error && <p className="text-center text-sm text-destructive">{error}</p>}
      </main>

      <Dialog open={showCallGuide} onOpenChange={(o) => !o && dismissCallGuide()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>How to answer</DialogTitle>
            <DialogDescription>
              This is a voice interview — just talk like you would on a call.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
              <Call02Icon size={20} className="shrink-0" />
              <p>
                <strong>Hold the mic button</strong> to speak, release when
                you&apos;re done.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
              <span className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
                Space
              </span>
              <p>
                Or <strong>press and hold the Space bar</strong> to talk and
                release to answer.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={dismissCallGuide}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DownloadBar({
  label,
  loaded,
  total,
}: {
  label: string;
  loaded: number;
  total: number;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <div className="space-y-1 text-sm">
      {lines.map((line, i) => {
        if (/^###/.test(line)) {
          return <p key={i} className="pt-1 font-semibold">{line.replace(/^#+ /, "")}</p>;
        }
        return <p key={i} dangerouslySetInnerHTML={{ __html: bold(line) }} />;
      })}
    </div>
  );
}

function bold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function InterviewResults({
  feedback,
  transcript,
  config,
}: {
  feedback: Feedback;
  transcript: string;
  config: InterviewConfig;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Interview Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {feedback && (
            <>
              <div className="flex items-start justify-between gap-4">
                <section>
                  <h3 className="mb-1 text-sm leading-tighter font-bold">Summary</h3>
                  <p className="text-sm text-muted-foreground">{feedback.summary}</p>
                </section>
                {feedback.score != null && feedback.score > 0 && (
                  <div className="flex shrink-0 flex-col items-center">
                    <div
                      className={`flex size-16 items-center justify-center rounded-full border-4 text-xl font-bold ${
                        feedback.score >= 8
                          ? "border-primary text-foreground"
                          : feedback.score >= 5
                            ? "border-yellow-400 text-yellow-500"
                            : "border-red-400 text-red-500"
                      }`}
                    >
                      {feedback.score}/10
                    </div>
                    <a
                      href="/leaderboard"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
                    >
                      <DashboardSquare01Icon size={14} />
                      Leaderboard
                    </a>
                  </div>
                )}
              </div>
              <section>
                <h3 className="mb-2 text-sm leading-tighter font-bold">Strengths</h3>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </section>
              <section>
                <h3 className="mb-2 text-sm leading-tighter font-bold">Areas to improve</h3>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </section>
              <section>
                <h3 className="mb-2 text-sm leading-tighter font-bold">Next steps</h3>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </section>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
          <p className="text-xs text-muted-foreground">
            {config.title} · saved to your account
          </p>
        </CardHeader>
        <CardContent>
          <Markdown text={transcript} />
        </CardContent>
      </Card>
    </div>
  );
}