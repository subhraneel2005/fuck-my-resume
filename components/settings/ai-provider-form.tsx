"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AiSettings {
  id: string;
  provider: string;
  model: string | null;
  apiKeyMasked: string;
  createdAt: string;
  updatedAt: string;
}

export function AiProviderForm() {
  const { data: session } = authClient.useSession();
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState<"openai" | "google">("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
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
        setProvider(data.settings.provider);
        setModel(data.settings.model || "");
      }
    } catch {
      // Settings not configured yet
    } finally {
      setLoading(false);
    }
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
        body: JSON.stringify({ provider, apiKey, model: model || undefined }),
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
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Provider</CardTitle>
        <CardDescription>
          Configure your own API key for AI features. Your key is encrypted and
          stored securely.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                onClick={handleDelete}
                disabled={saving}
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as "openai" | "google")}
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
                provider === "openai"
                  ? "sk-..."
                  : "AIza..."
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

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-green-600">Settings saved successfully</p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : settings ? "Update Key" : "Save Key"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
