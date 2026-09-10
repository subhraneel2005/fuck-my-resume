"use client"

import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from "@react-pdf/renderer"
import type { Resume } from "@/lib/schemas/resume"
import { parseContactUrl } from "@/lib/contact-links"

const styles = StyleSheet.create({
  page: {
    padding: "36 40",
    fontSize: 10,
    lineHeight: 1.45,
    color: "#000000",
    fontFamily: "Times-Roman",
  },
  header: {
    textAlign: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerLine: {
    fontSize: 9,
    marginTop: 2,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#000000",
    paddingBottom: 2,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontFamily: "Times-Italic",
    fontSize: 9,
  },
  meta: {
    fontSize: 9,
  },
  bullets: {
    marginTop: 2,
  },
  bullet: {
    flexDirection: "row",
    marginTop: 1,
  },
  bulletDot: {
    width: 10,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
  },
  coursework: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  courseworkItem: {
    width: "25%",
    fontSize: 9,
  },
  skills: {
    fontSize: 9,
  },
  skillsRow: {
    marginTop: 1,
  },
  block: {
    marginBottom: 4,
  },
})

interface PdfResumeProps {
  resume: Resume
}

export function PdfResume({ resume }: PdfResumeProps) {
  const { contact, education, relevantCoursework, experience, projects, technicalSkills, leadership } = resume

  const parsedLinkedin = parseContactUrl(contact.linkedin || "", "linkedin")
  const parsedGithub = parseContactUrl(contact.github || "", "github")

  const contactParts: React.ReactNode[] = []
  if (contact.phone) {
    contactParts.push(
      <Link key="phone" src={`tel:${contact.phone}`}>
        {contact.phone}
      </Link>
    )
  }
  if (contact.email) {
    contactParts.push(
      <Link key="email" src={`mailto:${contact.email}`}>
        {contact.email}
      </Link>
    )
  }
  if (parsedLinkedin.url && parsedLinkedin.display) {
    contactParts.push(
      <Link key="linkedin" src={parsedLinkedin.url}>
        {parsedLinkedin.display}
      </Link>
    )
  }
  if (parsedGithub.url && parsedGithub.display) {
    contactParts.push(
      <Link key="github" src={parsedGithub.url}>
        {parsedGithub.display}
      </Link>
    )
  }

  return (
    <Document title="resume.pdf">
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{contact.name}</Text>
          {contact.address && <Text style={styles.headerLine}>{contact.address}</Text>}
          {contactParts.length > 0 && (
            <Text style={styles.headerLine}>
              {contactParts.map((part, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <Text>{" ~ "}</Text>}
                  {part}
                </React.Fragment>
              ))}
            </Text>
          )}
        </View>

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, i) => (
              <View key={i} style={styles.block}>
                <View style={styles.row}>
                  <Text style={styles.bold}>
                    <RichPdfText text={edu.institution} />
                  </Text>
                  <Text style={styles.meta}>{edu.dateRange}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.italic}>
                    <RichPdfText text={edu.degree} />
                  </Text>
                  <Text style={styles.meta}>{edu.location}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Relevant Coursework */}
        {relevantCoursework.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Relevant Coursework</Text>
            <View style={styles.coursework}>
              {relevantCoursework.map((course, i) => (
                <Text key={i} style={styles.courseworkItem}>
                  {course}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, i) => (
              <View key={i} style={styles.block}>
                <View style={styles.row}>
                  <Text style={styles.bold}>
                    <RichPdfText text={exp.company} />
                  </Text>
                  <Text style={styles.meta}>{exp.dateRange}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.italic}>
                    <RichPdfText text={exp.position} />
                  </Text>
                  <Text style={styles.meta}>{exp.location}</Text>
                </View>
                <View style={styles.bullets}>
                  {exp.bulletPoints.map((bullet, j) => (
                    <Bullet key={j} text={bullet} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((project, i) => (
              <View key={i} style={styles.block}>
                <View style={styles.row}>
                  <Text style={styles.bold}>
                    <RichPdfText text={project.name} />
                    {project.technologies && (
                      <Text style={styles.italic}>{" | "}
                        <RichPdfText text={project.technologies} />
                      </Text>
                    )}
                  </Text>
                  <Text style={styles.meta}>{project.date}</Text>
                </View>
                <View style={styles.bullets}>
                  {project.bulletPoints.map((bullet, j) => (
                    <Bullet key={j} text={bullet} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Technical Skills */}
        {technicalSkills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <View style={styles.skills}>
              {technicalSkills.languages.length > 0 && (
                <Text style={styles.skillsRow}>
                  <Text style={styles.bold}>Languages: </Text>
                  {technicalSkills.languages.join(", ")}
                </Text>
              )}
              {technicalSkills.developerTools.length > 0 && (
                <Text style={styles.skillsRow}>
                  <Text style={styles.bold}>Developer Tools: </Text>
                  {technicalSkills.developerTools.join(", ")}
                </Text>
              )}
              {technicalSkills.technologiesFrameworks.length > 0 && (
                <Text style={styles.skillsRow}>
                  <Text style={styles.bold}>Technologies/Frameworks: </Text>
                  {technicalSkills.technologiesFrameworks.join(", ")}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Leadership */}
        {leadership.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leadership / Extracurricular</Text>
            {leadership.map((entry, i) => (
              <View key={i} style={styles.block}>
                <View style={styles.row}>
                  <Text style={styles.bold}>
                    <RichPdfText text={entry.organization} />
                  </Text>
                  <Text style={styles.meta}>{entry.dateRange}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.italic}>
                    <RichPdfText text={entry.position} />
                  </Text>
                  <Text style={styles.meta}>{entry.location}</Text>
                </View>
                <View style={styles.bullets}>
                  {entry.bulletPoints.map((bullet, j) => (
                    <Bullet key={j} text={bullet} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <Text style={styles.bulletDot}>{"\u2022"}</Text>
      <Text style={styles.bulletText}>
        <RichPdfText text={text} />
      </Text>
    </View>
  )
}

function RichPdfText({ text }: { text: string }) {
  const parts = text.split(/\*\*([^*]+)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <Text key={i} style={styles.bold}>{part}</Text> : part
      )}
    </>
  )
}