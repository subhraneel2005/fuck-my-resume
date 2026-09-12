export type KeyValidationResult =
  | { valid: true }
  | { valid: false; message: string; code: string };

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Checks a newly-entered API key against its provider before it is persisted.
 * Only rejects on a definitive auth failure (wrong key / no access). Transient
 * network or provider outages never block a save, so users are never locked out.
 */
export async function validateProviderKey(
  provider: "openai" | "google",
  apiKey: string
): Promise<KeyValidationResult> {
  try {
    if (provider === "google") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
        { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
      );

      if (res.ok) return { valid: true };

      const body = await res.json().catch(() => null);
      const reason: string | undefined =
        body?.error?.details?.[0]?.reason ?? body?.error?.status;

      if (res.status === 400 && reason === "API_KEY_INVALID") {
        return {
          valid: false,
          message:
            "This API key was rejected by Google AI. Double-check the key and try again.",
          code: "invalid_api_key",
        };
      }
      if (res.status === 403) {
        return {
          valid: false,
          message:
            "This API key can't access Google AI. Check the key, your project permissions, and that billing is enabled.",
          code: "permission",
        };
      }

      // Some other non-OK status (updates, outages) — don't block the save.
      return { valid: true };
    }

    // openai
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (res.ok) return { valid: true };

    if (res.status === 401) {
      return {
        valid: false,
        message:
          "This API key was rejected by OpenAI. Double-check the key and try again.",
        code: "invalid_api_key",
      };
    }

    return { valid: true };
  } catch {
    // Network error / provider unreachable — allow saving so users aren't stuck.
    return { valid: true };
  }
}