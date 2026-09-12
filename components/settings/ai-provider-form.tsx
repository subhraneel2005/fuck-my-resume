"use client";

import { useState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshIcon } from "@/components/ui/refresh";
import { Delete02Icon } from "@/components/ui/delete-02";
import { CircleCheckIcon } from "@/components/ui/circle-check";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  VOICE_ENGINES,
  INTERVIEWER_BRAIN_MODELS,
  enginesForProvider,
  engineConfig,
  resolveTtsVoice,
  INTERVIEW_NOT_SUPPORTED_BANNER,
  type Provider,
  type VoiceEngine,
} from "@/lib/interview-models";

interface AiSettings {
  id: string;
  provider: string;
  model: string | null;
  apiKeyMasked: string;
  voiceEngine: string | null;
  interviewerModel: string | null;
  sttModel: string | null;
  ttsModel: string | null;
  ttsVoice: string | null;
  createdAt: string;
  updatedAt: string;
}

type KeyDialogState = null | "validating" | "success" | "invalid";

export function AiProviderForm() {
  const { data: session } = authClient.useSession();
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState<Provider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [voiceEngine, setVoiceEngine] = useState<VoiceEngine>("openai");
  const [interviewerModel, setInterviewerModel] = useState("");
  const [sttModel, setSttModel] = useState("");
  const [ttsModel, setTtsModel] = useState("");
  const [ttsVoice, setTtsVoice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [keyDialog, setKeyDialog] = useState<KeyDialogState>(null);
  const [dialogMessage, setDialogMessage] = useState("");
  const [rotateOpen, setRotateOpen] = useState(false);
  const apiKeyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session) return;
    fetchSettings();
  }, [session]);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings/ai-provider");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        const s = data.settings as AiSettings;
        const p = (s.provider as Provider) || "openai";
        setProvider(p);
        setModel(s.model || "");
        const available = enginesForProvider(p);
        const eng = (s.voiceEngine as VoiceEngine) || available[0];
        setVoiceEngine(available.includes(eng) ? eng : available[0]);
        setInterviewerModel(s.interviewerModel || "");
        setSttModel(s.sttModel || "");
        setTtsModel(s.ttsModel || "");
        setTtsVoice(s.ttsVoice || "");
      } else {
        const first = enginesForProvider("openai")[0];
        setProvider("openai");
        setVoiceEngine(first);
      }
    } catch {
      // Settings not configured yet
    } finally {
      setLoading(false);
    }
  }

  function handleProviderChange(p: Provider) {
    setProvider(p);
    const available = enginesForProvider(p);
    if (!available.includes(voiceEngine)) {
      setVoiceEngine(available[0]);
    }
  }

  function handleEngineChange(engine: VoiceEngine) {
    setVoiceEngine(engine);
    const cfg = engineConfig(engine);
    setSttModel((current) =>
      cfg.sttModels.some((m) => m.id === current) ? current : cfg.defaultSttModel
    );
    setTtsModel((current) =>
      cfg.ttsModels.some((m) => m.id === current) ? current : cfg.defaultTtsModel
    );
    setTtsVoice((current) =>
      cfg.voices.some((v) => v.id === current) ? current : cfg.defaultVoice
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const hasNewKey = apiKey.trim().length > 0;
    if (hasNewKey) {
      setKeyDialog("validating");
    }

    try {
      const res = await fetch("/api/settings/ai-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: apiKey || undefined,
          model: model || undefined,
          voiceEngine,
          interviewerModel: interviewerModel || undefined,
          sttModel: sttModel || undefined,
          ttsModel: ttsModel || undefined,
          ttsVoice: ttsVoice || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = data?.error || "Failed to save";
        if (hasNewKey) {
          setDialogMessage(message);
          setKeyDialog("invalid");
        } else {
          setError(message);
        }
        return;
      }

      if (hasNewKey) {
        setKeyDialog("success");
      } else {
        setSuccess(true);
      }
      setApiKey(""); // Clear the input
      await fetchSettings(); // Refresh settings
    } catch (err) {
      if (keyDialog === "validating") {
        setDialogMessage(
          err instanceof Error ? err.message : "Something went wrong"
        );
        setKeyDialog("invalid");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to remove your API key?")) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/settings/ai-provider", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      setSettings(null);
      setApiKey("");
      setModel("");
      setVoiceEngine("openai");
      setInterviewerModel("");
      setSttModel("");
      setTtsModel("");
      setTtsVoice("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function handleRotateConfirm() {
    setApiKey("");
    setRotateOpen(false);
    setTimeout(() => apiKeyRef.current?.focus(), 50);
  }

  const providerLabel = provider === "google" ? "Google AI" : "OpenAI";

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

  const availableEngines = enginesForProvider(provider);
  const effectiveEngine: VoiceEngine = availableEngines.includes(voiceEngine)
    ? voiceEngine
    : availableEngines[0];
  const voiceCfg = engineConfig(effectiveEngine);
  const brainOptions = INTERVIEWER_BRAIN_MODELS[provider];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Provider</CardTitle>
          <CardDescription>
            Configure your own API key for AI features. Your key is verified
            against {providerLabel} before saving and encrypted at rest.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings && (
            <div className="mb-6 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Current:{" "}
                    <span className="capitalize">{settings.provider}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Key: {settings.apiKeyMasked}
                  </p>
                  {settings.model && (
                    <p className="text-xs text-muted-foreground">
                      Model: {settings.model}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setRotateOpen(true)}
                    disabled={saving}
                  >
                    <RefreshIcon size={14} className="mr-1.5 shrink-0" />
                    Rotate Key
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    <Delete02Icon size={14} className="mr-1.5 shrink-0" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as Provider)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="openai">OpenAI</option>
                <option value="google">Google AI</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">
                API Key
                {settings && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (leave blank to keep current)
                  </span>
                )}
              </Label>
              <Input
                id="apiKey"
                ref={apiKeyRef}
                type="password"
                placeholder={
                  provider === "openai" ? "sk-..." : "AIza..."
                }
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required={!settings}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">
                Model{" "}
                <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="model"
                placeholder={
                  provider === "openai" ? "gpt-4o" : "gemini-3.5-flash"
                }
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : settings ? "Update Key" : "Save Key"}
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mock Interviewer Voice</CardTitle>
          <CardDescription>
            Choose how the AI mock interviewer speaks and listens. Google voice
            models are not supported — pick an OpenAI key or the free in-browser
            voice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {provider === "google" && (
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-600">
              {INTERVIEW_NOT_SUPPORTED_BANNER}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="voiceEngine">Voice engine</Label>
            <select
              id="voiceEngine"
              value={effectiveEngine}
              onChange={(e) => handleEngineChange(e.target.value as VoiceEngine)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {availableEngines.map((eng) => (
                <option key={eng} value={eng}>
                  {VOICE_ENGINES[eng].label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {voiceCfg.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewerModel">Interviewer model (brain)</Label>
            <select
              id="interviewerModel"
              value={interviewerModel || brainOptions[0].id}
              onChange={(e) => setInterviewerModel(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {brainOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              The LLM that runs the interviewer. Always billed to your BYOK key.
            </p>
          </div>

          {effectiveEngine !== "browser" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sttModel">Speech-to-text (STT)</Label>
                <select
                  id="sttModel"
                  value={sttModel || voiceCfg.defaultSttModel}
                  onChange={(e) => setSttModel(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {voiceCfg.sttModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ttsModel">Text-to-speech (TTS)</Label>
                <select
                  id="ttsModel"
                  value={ttsModel || voiceCfg.defaultTtsModel}
                  onChange={(e) => setTtsModel(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {voiceCfg.ttsModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="ttsVoice">Voice</Label>
            <select
              id="ttsVoice"
              value={resolveTtsVoice(effectiveEngine, ttsVoice)}
              onChange={(e) => setTtsVoice(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {voiceCfg.voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-muted-foreground">
            Changes apply to new interviews. You can also pick the voice engine
            per interview on the Mock Interview page.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-green-600">
              Settings saved successfully
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Interviewer Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {keyDialog === "validating" && (
        <AlertDialog
          open
          onOpenChange={() => {
            // Keep open while the request is in flight.
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <RefreshIcon className="animate-spin" />
              </AlertDialogMedia>
              <AlertDialogTitle>Validating your API key</AlertDialogTitle>
              <AlertDialogDescription>
                Checking your key with {providerLabel} before saving. This takes
                a few seconds.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {keyDialog === "success" && (
        <AlertDialog open onOpenChange={() => setKeyDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <CircleCheckIcon className="text-green-600" />
              </AlertDialogMedia>
              <AlertDialogTitle>API key verified</AlertDialogTitle>
              <AlertDialogDescription>
                Your new key works and has been saved securely. It's now used
                for resume, outreach, and mock interview features.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setKeyDialog(null)}>
                Done
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {keyDialog === "invalid" && (
        <AlertDialog open onOpenChange={() => setKeyDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </AlertDialogMedia>
              <AlertDialogTitle>Invalid API key</AlertDialogTitle>
              <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {rotateOpen && (
        <AlertDialog open onOpenChange={setRotateOpen}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <RefreshIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>Rotate API key?</AlertDialogTitle>
              <AlertDialogDescription>
                Your current key will be replaced. Paste the new key after
                confirming, then save. The old key will stop working for AI
                features immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRotateConfirm}>
                Rotate key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </form>
  );
}