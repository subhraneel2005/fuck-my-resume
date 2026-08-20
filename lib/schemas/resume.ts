import { z } from "zod";

// Contact information schema
export const contactSchema = z.object({
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  linkedin: z.string(),
  github: z.string(),
});

// Education entry schema
export const educationSchema = z.object({
  institution: z.string(),
  dateRange: z.string(),
  degree: z.string(),
  location: z.string(),
});

// Work experience entry schema
export const experienceSchema = z.object({
  company: z.string(),
  dateRange: z.string(),
  position: z.string(),
  location: z.string(),
  bulletPoints: z.array(z.string()),
});

// Project entry schema
export const projectSchema = z.object({
  name: z.string(),
  technologies: z.string(),
  date: z.string(),
  bulletPoints: z.array(z.string()),
});

// Technical skills schema
export const technicalSkillsSchema = z.object({
  languages: z.array(z.string()),
  developerTools: z.array(z.string()),
  technologiesFrameworks: z.array(z.string()),
});

// Leadership/Extracurricular entry schema
export const leadershipSchema = z.object({
  organization: z.string(),
  dateRange: z.string(),
  position: z.string(),
  location: z.string(),
  bulletPoints: z.array(z.string()),
});

// Main resume schema
export const resumeSchema = z.object({
  contact: contactSchema,
  education: z.array(educationSchema),
  relevantCoursework: z.array(z.string()),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  technicalSkills: technicalSkillsSchema,
  leadership: z.array(leadershipSchema),
});

// AI-change annotation: which bullets/content the LLM created or rewrote. The
// bullet strings are copied verbatim from the final resume so they can be
// matched back to exact indexes instead of relying on fragile counts.
export const aiChangesSchema = z.object({
  addedBullets: z.array(
    z.object({
      section: z.enum(["experience", "projects", "leadership"]),
      bullets: z.array(z.string()),
    })
  ),
  tailoredBullets: z.array(
    z.object({
      section: z.enum(["experience", "projects", "leadership"]),
      bullets: z.array(z.string()),
    })
  ),
  addedSkills: z.array(z.string()),
  addedCoursework: z.array(z.string()),
});

export const parseResultSchema = z.object({
  resume: resumeSchema,
  aiChanges: aiChangesSchema,
});

// Type exports
export type Contact = z.infer<typeof contactSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type TechnicalSkills = z.infer<typeof technicalSkillsSchema>;
export type Leadership = z.infer<typeof leadershipSchema>;
export type Resume = z.infer<typeof resumeSchema>;
export type AiChanges = z.infer<typeof aiChangesSchema>;
export type ParseResult = z.infer<typeof parseResultSchema>;
