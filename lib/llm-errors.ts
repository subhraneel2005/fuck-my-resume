export type LlmErrorCode =
  | "invalid_api_key"
  | "rate_limit"
  | "permission"
  | "model_not_found"
  | "provider"
  | "unknown";

export interface LlmErrorInfo {
  code: LlmErrorCode;
  message: string;
  toSettings: boolean;
}

export function describeLlmError(error: unknown): LlmErrorInfo {
  const e = (error ?? {}) as {
    statusCode?: number;
    name?: string;
    message?: string;
  };
  const status = e.statusCode;
  const msg = typeof e.message === "string" ? e.message : "";

  if (
    status === 401 ||
    /incorrect api key|invalid api key|api key not valid|api key invalid|unauthorized|authentication failed|API_KEY_INVALID/i.test(
      msg
    )
  ) {
    return {
      code: "invalid_api_key",
      message:
        "Your API key was rejected — it may be wrong, revoked, or expired. Update it in Settings and try again.",
      toSettings: true,
    };
  }

  if (
    status === 429 ||
    /rate limit|quota|too many requests|insufficient_quota/i.test(msg)
  ) {
    return {
      code: "rate_limit",
      message:
        "Your API key hit a rate limit or is out of quota. Wait a minute and try again.",
      toSettings: false,
    };
  }

  if (
    status === 403 ||
    /permission denied|access denied|forbidden/i.test(msg)
  ) {
    return {
      code: "permission",
      message:
        "Your API key doesn't have access to this model. Check permissions and billing on your provider's dashboard.",
      toSettings: true,
    };
  }

  if (status === 404 || /model.*not found|not found/i.test(msg)) {
    return {
      code: "model_not_found",
      message:
        "The model you selected isn't available. Pick a different model in Settings.",
      toSettings: true,
    };
  }

  if (typeof status === "number" && status >= 500) {
    return {
      code: "provider",
      message:
        "The AI provider is having issues right now. Try again in a moment.",
      toSettings: false,
    };
  }

  return {
    code: "unknown",
    message:
      "Something went wrong while talking to the AI provider. Try again in a moment.",
    toSettings: false,
  };
}