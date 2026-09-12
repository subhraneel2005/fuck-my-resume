import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

// Ciphertext version prefix. `v2:` rows are encrypted with AI_KEY_ENCRYPTION_KEY
// (a dedicated master key independent of the auth secret). Legacy rows have no
// prefix and use BETTER_AUTH_SECRET. Keeping both readable lets us lazily
// migrate rows on first use — no downtime, no key-loss risk.
const V2_PREFIX = "v2:";

type KeyVersion = "v2" | "legacy";

function getKey(version: KeyVersion): Buffer {
  if (version === "v2") {
    const secret = process.env.AI_KEY_ENCRYPTION_KEY;
    if (!secret) {
      throw new Error("AI_KEY_ENCRYPTION_KEY is required for v2 encryption");
    }
    return createHash("sha256").update(secret).digest();
  }
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required for encryption");
  return createHash("sha256").update(secret).digest();
}

export function encrypt(text: string): string {
  // New encodes use the dedicated master key when available; fall back to the
  // legacy auth-secret scheme so nothing breaks before the env var is added.
  const version: KeyVersion = process.env.AI_KEY_ENCRYPTION_KEY ? "v2" : "legacy";
  const key = getKey(version);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  // Format: [v2:]<ivHex>:<tagHex>:<ciphertextHex>
  const prefix = version === "v2" ? V2_PREFIX : "";
  return `${prefix}${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const version: KeyVersion = encryptedText.startsWith(V2_PREFIX) ? "v2" : "legacy";
  const payload = version === "v2" ? encryptedText.slice(V2_PREFIX.length) : encryptedText;
  const key = getKey(version);
  const [ivHex, tagHex, ciphertext] = payload.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Returns a `v2:` re-encryption of a legacy row, or null when the row is already
 * current (or the dedicated master key isn't configured yet). Callers persist
 * the returned value back to the row — this is the safe lazy-migration path.
 */
export function migrateApiKeyIfLegacy(encryptedText: string): string | null {
  if (encryptedText.startsWith(V2_PREFIX)) return null;
  if (!process.env.AI_KEY_ENCRYPTION_KEY) return null;
  return encrypt(decrypt(encryptedText));
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 4) + "••••" + key.slice(-4);
}