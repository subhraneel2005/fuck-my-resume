const DOMAINS = {
  github: "github.com",
  linkedin: "linkedin.com",
} as const;

export type LinkKind = keyof typeof DOMAINS;

export interface ParsedContactLink {
  handle: string;
  display: string;
  url: string;
}

// Extracts a clean handle from messy LLM output, tolerating doubled domains,
// schemes, "www." and "/in/" markers: "github.com/github.com/subhraneel2005"
// -> "subhraneel2005", "https://www.linkedin.com/in/user" -> "user".
function cleanHandle(value: string, kind: LinkKind): string {
  let s = value.trim();
  if (!s) return "";

  s = s.replace(/^(https?:\/\/)?(www\.)?/i, "");

  const domain = DOMAINS[kind];
  const idx = s.lastIndexOf(domain);
  if (idx >= 0) {
    s = s.slice(idx + domain.length);
  }

  s = s
    .replace(/^[/]+/, "")
    .replace(/^in[/]+/i, "")
    .replace(/[/]{2,}/g, "/")
    .replace(/[/]+$/, "")
    .replace(/[.,;'"\s]+$/, "")
    .trim();

  return s;
}

export function parseContactUrl(value: string, kind: LinkKind): ParsedContactLink {
  const handle = cleanHandle(value, kind);
  if (!handle) {
    return { handle: "", display: "", url: "" };
  }

  const prefix = kind === "linkedin" ? `https://linkedin.com/in/${handle}` : `https://github.com/${handle}`;
  const displayPrefix = kind === "linkedin" ? `linkedin.com/in/${handle}` : `github.com/${handle}`;

  return { handle, display: displayPrefix, url: prefix };
}