"use client"

import type { Resume } from "@/lib/schemas/resume"
import { parseContactUrl } from "@/lib/contact-links"

interface ResumePreviewProps {
  resume: Resume
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  const { contact, education, relevantCoursework, experience, projects, technicalSkills, leadership } = resume

  const parsedLinkedin = parseContactUrl(contact.linkedin || "", "linkedin")
  const parsedGithub = parseContactUrl(contact.github || "", "github")

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
              <span key={i}>{course}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section title="Experience">
          {experience.map((exp, i) => (
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
                  <li key={j} style={{ fontSize: "10px" }}><RichText text={bullet} /></li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((project, i) => (
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
                  <li key={j} style={{ fontSize: "10px" }}><RichText text={bullet} /></li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* Technical Skills */}
      {technicalSkills && (
        <Section title="Technical Skills">
          <div style={{ fontSize: "10px" }}>
            {technicalSkills.languages.length > 0 && (
              <p style={{ margin: "1px 0" }}><strong>Languages:</strong> {technicalSkills.languages.join(", ")}</p>
            )}
            {technicalSkills.developerTools.length > 0 && (
              <p style={{ margin: "1px 0" }}><strong>Developer Tools:</strong> {technicalSkills.developerTools.join(", ")}</p>
            )}
            {technicalSkills.technologiesFrameworks.length > 0 && (
              <p style={{ margin: "1px 0" }}><strong>Technologies/Frameworks:</strong> {technicalSkills.technologiesFrameworks.join(", ")}</p>
            )}
          </div>
        </Section>
      )}

      {/* Leadership */}
      {leadership.length > 0 && (
        <Section title="Leadership / Extracurricular">
          {leadership.map((entry, i) => (
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
                  <li key={j} style={{ fontSize: "10px" }}><RichText text={bullet} /></li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*([^*]+)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      )}
    </>
  )
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
