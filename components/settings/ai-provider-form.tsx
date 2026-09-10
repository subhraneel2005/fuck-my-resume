"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshIcon } from "@/components/ui/refresh";
import { Delete02Icon } from "@/components/ui/delete-02";
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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSuccess(true);
      setApiKey(""); // Clear the input
      await fetchSettings(); // Refresh settings
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
            Configure your own API key for AI features. Your key is encrypted and
            stored securely.
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
    </form>
  );
}