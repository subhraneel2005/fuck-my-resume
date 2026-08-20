import type { AiChanges, Resume } from "@/lib/schemas/resume";

export interface EntryHighlights {
  added: number[];
  tailored: number[];
  jd: Record<number, string[]>;
}

export interface Highlights {
  experience: EntryHighlights[];
  projects: EntryHighlights[];
  leadership: EntryHighlights[];
  addedSkills: string[];
  addedCoursework: string[];
}

type SectionName = "experience" | "projects" | "leadership";

const STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "that", "this", "your", "you",
  "are", "will", "have", "has", "had", "our", "their", "they", "them",
  "who", "what", "when", "where", "how", "into", "over", "under",
  "using", "used", "use", "such", "more", "most", "than", "then",
  "was", "were", "been", "being", "etc", "like", "also", "can", "all",
  "any", "each", "or", "of", "to", "in", "on", "at", "as", "an", "by",
  "it", "is", "be", "we", "not", "but", "if", "so", "do", "per", "job",
]);

// Generic single words that would produce noisy highlights on their own; only
// applied to 1-token phrases (multi-word phrases are always specific enough).
const GENERIC_TERMS = new Set([
  "software", "engineer", "engineering", "engineers", "developer",
  "development", "developing", "experience", "experienced", "building",
  "strong", "strongly", "scalable", "scaling", "system", "systems",
  "product", "products", "data", "cloud", "management", "managing",
  "team", "teams", "working", "work", "knowledge", "skills", "skill",
  "ability", "design", "designing", "implementing", "implementation",
  "including", "related", "etc", "ability", "across", "within",
  "design", "best", "practices", "good", "great", "excellent",
]);

function normalizeTerm(token: string): string {
  return token.toLowerCase().replace(/[.,;:!?()'"“”]/g, "");
}

// Returns candidate JD phrases (1-3 token n-grams), longest first so that
// overlapping matches resolve to the most specific phrase.
export function tokenizeJd(jobDescription: string): string[] {
  if (!jobDescription) return [];

  const tokens = jobDescription
    .split(/[^a-zA-Z0-9]+/)
    .map(normalizeTerm)
    .filter(
      (t) => t.length >= 3 && !/^\d+$/.test(t) && !STOPWORDS.has(t)
    );

  const phrases = new Set<string>();
  for (let i = 0; i < tokens.length; i++) {
    for (let len = 1; len <= 3 && i + len <= tokens.length; len++) {
      const phrase = tokens.slice(i, i + len).join(" ");
      if (phrase.length < 3) continue;
      if (len === 1 && GENERIC_TERMS.has(phrase)) continue;
      phrases.add(phrase);
    }
  }

  return [...phrases].sort((a, b) => b.length - a.length);
}

function sectionEntries(resume: Resume, section: SectionName) {
  return section === "experience"
    ? resume.experience
    : section === "projects"
      ? resume.projects
      : resume.leadership;
}

// Maps exact bullet strings to (entry * 1000 + bulletIndex) codes. Annotated
// text that doesn't match the final resume is silently dropped.
function resolveBullets(
  resume: Resume,
  section: SectionName,
  texts: string[]
): number[] {
  const entries = sectionEntries(resume, section);
  const codes: number[] = [];
  for (const text of texts) {
    scan: for (let e = 0; e < entries.length; e++) {
      const bullets = entries[e].bulletPoints;
      for (let b = 0; b < bullets.length; b++) {
        if (bullets[b] === text) {
          codes.push(e * 1000 + b);
          break scan;
        }
      }
    }
  }
  return codes;
}

function matchJdKeywords(
  resume: Resume,
  section: SectionName,
  phrases: string[]
): EntryHighlights[] {
  return sectionEntries(resume, section).map((entry) => {
    const jd: Record<number, string[]> = {};
    entry.bulletPoints.forEach((bullet, b) => {
      const text = bullet.toLowerCase();
      const found = phrases.filter((p) => text.includes(p));
      if (found.length > 0) jd[b] = found;
    });
    return { added: [], tailored: [], jd };
  });
}

function buildSection(
  resume: Resume,
  section: SectionName,
  addedFlat: number[],
  tailoredFlat: number[],
  jdPhrases: string[]
): EntryHighlights[] {
  const flat = (
    codes: number[],
    e: number
  ) => codes.filter((c) => Math.floor(c / 1000) === e).map((c) => c % 1000);

  return matchJdKeywords(resume, section, jdPhrases).map((jd, e) => ({
    added: flat(addedFlat, e),
    tailored: flat(tailoredFlat, e),
    jd: jd.jd,
  }));
}

function bucketTexts(
  aiChanges: AiChanges,
  kind: "addedBullets" | "tailoredBullets"
): Record<SectionName, string[]> {
  const out: Record<SectionName, string[]> = {
    experience: [],
    projects: [],
    leadership: [],
  };
  for (const bucket of aiChanges[kind]) {
    out[bucket.section].push(...bucket.bullets);
  }
  return out;
}

function keepIfAbsentInText(
  values: string[],
  resumeText: string,
  excludedTerms: Set<string>
): string[] {
  if (values.length === 0) return [];
  const haystack = resumeText.toLowerCase();
  return values.filter(
    (v) =>
      v &&
      !haystack.includes(v.toLowerCase()) &&
      !excludedTerms.has(normalizeTerm(v))
  );
}

export function buildHighlights(
  aiChanges: AiChanges,
  resume: Resume,
  resumeText: string,
  jobDescription?: string
): Highlights {
  const addedTexts = bucketTexts(aiChanges, "addedBullets");
  const tailoredTexts = bucketTexts(aiChanges, "tailoredBullets");
  const jdPhrases = tokenizeJd(jobDescription || "");
  const excludedJdTerms = new Set(jdPhrases.map((p) => normalizeTerm(p)));

  const build = (section: SectionName) =>
    buildSection(
      resume,
      section,
      resolveBullets(resume, section, addedTexts[section]),
      resolveBullets(resume, section, tailoredTexts[section]),
      jdPhrases
    );

  return {
    experience: build("experience"),
    projects: build("projects"),
    leadership: build("leadership"),
    addedSkills: keepIfAbsentInText(
      aiChanges.addedSkills,
      resumeText,
      excludedJdTerms
    ),
    addedCoursework: keepIfAbsentInText(
      aiChanges.addedCoursework,
      resumeText,
      excludedJdTerms
    ),
  };
}

export function emptyHighlights(resume: Resume): Highlights {
  const section = (count: number): EntryHighlights[] =>
    Array.from({ length: count }, () => ({ added: [], tailored: [], jd: {} }));
  return {
    experience: section(resume.experience.length),
    projects: section(resume.projects.length),
    leadership: section(resume.leadership.length),
    addedSkills: [],
    addedCoursework: [],
  };
}

export function hasHighlights(highlights: Highlights): boolean {
  const sections = [
    ...highlights.experience,
    ...highlights.projects,
    ...highlights.leadership,
  ];
  return (
    sections.some(
      (s) =>
        s.added.length > 0 ||
        s.tailored.length > 0 ||
        Object.keys(s.jd).length > 0
    ) ||
    highlights.addedSkills.length > 0 ||
    highlights.addedCoursework.length > 0
  );
}