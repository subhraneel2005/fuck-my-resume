"use client"

import type { Resume } from "@/lib/schemas/resume"
import { parseContactUrl } from "@/lib/contact-links"
import { hasHighlights, type Highlights } from "@/lib/highlights"
import type { EntryHighlights } from "@/lib/highlights"

interface ResumePreviewProps {
  resume: Resume
  highlights?: Highlights | null
}

const EMPTY_ENTRY: EntryHighlights = { added: [], tailored: [], jd: {} }

const ADDED_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(245, 158, 11, 0.22)",
  borderLeft: "3px solid #d97706",
  paddingLeft: "4px",
}

const TAILORED_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(59, 130, 246, 0.10)",
}

const ADDED_CHIP_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(245, 158, 11, 0.22)",
  borderBottom: "2px solid #d97706",
  padding: "0 2px",
}

export function ResumePreview({ resume, highlights }: ResumePreviewProps) {
  const { contact, education, relevantCoursework, experience, projects, technicalSkills, leadership } = resume

  const parsedLinkedin = parseContactUrl(contact.linkedin || "", "linkedin")
  const parsedGithub = parseContactUrl(contact.github || "", "github")

  const showLegend = highlights ? hasHighlights(highlights) : false
  const addedSkills = new Set(highlights?.addedSkills ?? [])
  const addedCoursework = new Set(highlights?.addedCoursework ?? [])

  const entryAt = (section: EntryHighlights[] | undefined, i: number): EntryHighlights =>
    section?.[i] ?? EMPTY_ENTRY

  return (
    <div
      id="resume-preview"
      style={{
        backgroundColor: "#ffffff",
        color: "#000000",
        padding: "40px 48px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "11px",
        lineHeight: "1.4",
        width: "8.5in",
        minHeight: "11in",
        margin: "0 auto",
      }}
    >
      {showLegend && <HighlightLegend />}

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "bold", letterSpacing: "0.05em", margin: 0 }}>
          {contact.name}
        </h1>
        {contact.address && (
          <p style={{ fontSize: "10px", marginTop: "2px" }}>{contact.address}</p>
        )}
        <p style={{ fontSize: "10px", marginTop: "2px" }}>
          {contact.phone && <span>{contact.phone}</span>}
          {contact.phone && contact.email && <span> ~ </span>}
          {contact.email && <span>{contact.email}</span>}
          {contact.email && parsedLinkedin.display && <span> ~ </span>}
          {parsedLinkedin.display && <span>{parsedLinkedin.display}</span>}
          {parsedLinkedin.display && parsedGithub.display && <span> ~ </span>}
          {parsedGithub.display && <span>{parsedGithub.display}</span>}
        </p>
      </div>

      {/* Education */}
      {education.length > 0 && (
        <Section title="Education">
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                <span><RichText text={edu.institution} /></span>
                <span style={{ fontSize: "10px" }}>{edu.dateRange}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontStyle: "italic", fontSize: "10px" }}>
                <span><RichText text={edu.degree} /></span>
                <span>{edu.location}</span>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Relevant Coursework */}
      {relevantCoursework.length > 0 && (
        <Section title="Relevant Coursework">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px 8px", fontSize: "10px" }}>
            {relevantCoursework.map((course, i) => (
              <span key={i} style={addedCoursework.has(course) ? ADDED_CHIP_STYLE : undefined}>
                {course}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section title="Experience">
          {experience.map((exp, i) => {
            const hl = entryAt(highlights?.experience, i)
            return (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                  <span><RichText text={exp.company} /></span>
                  <span style={{ fontSize: "10px" }}>{exp.dateRange}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontStyle: "italic", fontSize: "10px" }}>
                  <span><RichText text={exp.position} /></span>
                  <span>{exp.location}</span>
                </div>
                <ul style={{ listStyleType: "disc", marginLeft: "16px", marginTop: "2px" }}>
                  {exp.bulletPoints.map((bullet, j) => (
                    <BulletItem
                      key={j}
                      text={bullet}
                      hl={hl}
                      bulletIndex={j}
                    />
                  ))}
                </ul>
              </div>
            )
          })}
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((project, i) => {
            const hl = entryAt(highlights?.projects, i)
            return (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>
                    <strong><RichText text={project.name} /></strong>
                    {project.technologies && <em> | <RichText text={project.technologies} /></em>}
                  </span>
                  <span style={{ fontSize: "10px" }}>{project.date}</span>
                </div>
                <ul style={{ listStyleType: "disc", marginLeft: "16px", marginTop: "2px" }}>
                  {project.bulletPoints.map((bullet, j) => (
                    <BulletItem
                      key={j}
                      text={bullet}
                      hl={hl}
                      bulletIndex={j}
                    />
                  ))}
                </ul>
              </div>
            )
          })}
        </Section>
      )}

      {/* Technical Skills */}
      {technicalSkills && (
        <Section title="Technical Skills">
          <div style={{ fontSize: "10px" }}>
            {technicalSkills.languages.length > 0 && (
              <p style={{ margin: "1px 0" }}>
                <strong>Languages:</strong>{" "}
                <SkillTokens skills={technicalSkills.languages} added={addedSkills} />
              </p>
            )}
            {technicalSkills.developerTools.length > 0 && (
              <p style={{ margin: "1px 0" }}>
                <strong>Developer Tools:</strong>{" "}
                <SkillTokens skills={technicalSkills.developerTools} added={addedSkills} />
              </p>
            )}
            {technicalSkills.technologiesFrameworks.length > 0 && (
              <p style={{ margin: "1px 0" }}>
                <strong>Technologies/Frameworks:</strong>{" "}
                <SkillTokens skills={technicalSkills.technologiesFrameworks} added={addedSkills} />
              </p>
            )}
          </div>
        </Section>
      )}

      {/* Leadership */}
      {leadership.length > 0 && (
        <Section title="Leadership / Extracurricular">
          {leadership.map((entry, i) => {
            const hl = entryAt(highlights?.leadership, i)
            return (
              <div key={i} style={{ marginBottom: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                  <span><RichText text={entry.organization} /></span>
                  <span style={{ fontSize: "10px" }}>{entry.dateRange}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontStyle: "italic", fontSize: "10px" }}>
                  <span><RichText text={entry.position} /></span>
                  <span>{entry.location}</span>
                </div>
                <ul style={{ listStyleType: "disc", marginLeft: "16px", marginTop: "2px" }}>
                  {entry.bulletPoints.map((bullet, j) => (
                    <BulletItem
                      key={j}
                      text={bullet}
                      hl={hl}
                      bulletIndex={j}
                    />
                  ))}
                </ul>
              </div>
            )
          })}
        </Section>
      )}
    </div>
  )
}

function BulletItem({
  text,
  hl,
  bulletIndex,
}: {
  text: string
  hl: EntryHighlights
  bulletIndex: number
}) {
  let style: React.CSSProperties | undefined = undefined
  if (hl.added.includes(bulletIndex)) style = { ...ADDED_STYLE }
  else if (hl.tailored.includes(bulletIndex)) style = { ...TAILORED_STYLE }

  const jdPhrases = hl.jd[bulletIndex] ?? []

  return (
    <li style={{ fontSize: "10px", ...style }}>
      <RichText text={text} phrases={jdPhrases} />
    </li>
  )
}

function SkillTokens({ skills, added }: { skills: string[]; added: Set<string> }) {
  return (
    <>
      {skills.map((skill, i) => (
        <span key={skill}>
          {i > 0 && ", "}
          <span style={added.has(skill) ? ADDED_CHIP_STYLE : undefined}>{skill}</span>
        </span>
      ))}
    </>
  )
}

function HighlightLegend() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        fontSize: "10px",
        marginBottom: "10px",
        paddingBottom: "6px",
        borderBottom: "1px dashed #cbd5e1",
      }}
    >
      <LegendChip color="#d97706" label="Added by AI" />
      <LegendChip color="#3b82f6" label="Reworded / Tailored" />
      <LegendChip color="#ca8a04" label="JD keyword match" />
    </div>
  )
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
      <span
        style={{
          display: "inline-block",
          width: "10px",
          height: "10px",
          backgroundColor: color,
          borderRadius: "2px",
          opacity: 0.85,
        }}
      />
      {label}
    </span>
  )
}

function RichText({ text, phrases = [] }: { text: string; phrases?: string[] }) {
  const parts = text.split(/\*\*([^*]+)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i}>{highlightPhrases(part, phrases)}</strong>
        ) : (
          highlightPhrases(part, phrases)
        )
      )}
    </>
  )
}

// Wraps every occurrence of the given phrases in a <mark> highlight, merging
// overlapping spans (longest phrase wins).
function highlightPhrases(text: string, phrases: string[]): React.ReactNode {
  if (!phrases || phrases.length === 0) return text

  const lower = text.toLowerCase()
  const spans: Array<{ start: number; end: number }> = []
  for (const phrase of phrases) {
    const needle = phrase.toLowerCase()
    let idx = lower.indexOf(needle)
    while (idx !== -1) {
      spans.push({ start: idx, end: idx + needle.length })
      idx = lower.indexOf(needle, idx + needle.length)
    }
  }
  if (spans.length === 0) return text

  spans.sort((a, b) => a.start - b.start || b.end - a.end)
  const merged: Array<{ start: number; end: number }> = []
  for (const span of spans) {
    const last = merged[merged.length - 1]
    if (last && span.start < last.end) {
      if (span.end > last.end) last.end = span.end
    } else {
      merged.push({ ...span })
    }
  }

  const nodes: React.ReactNode[] = []
  let pos = 0
  for (const span of merged) {
    if (span.start > pos) nodes.push(text.slice(pos, span.start))
    nodes.push(
      <mark
        key={span.start}
        style={{ backgroundColor: "#fde047", color: "#000000", padding: "0 1px" }}
      >
        {text.slice(span.start, span.end)}
      </mark>
    )
    pos = span.end
  }
  if (pos < text.length) nodes.push(text.slice(pos))
  return nodes
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "8px" }}>
      <h2 style={{
        fontSize: "14px",
        fontWeight: "bold",
        textTransform: "uppercase",
        borderBottom: "1px solid #000000",
        paddingBottom: "2px",
        marginBottom: "4px",
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}