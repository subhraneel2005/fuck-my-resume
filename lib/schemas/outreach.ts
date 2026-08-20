import { z } from "zod";

export const coldEmailSchema = z.object({
  recipientName: z.string(),
  companyName: z.string(),
  specificThing: z.string(),
  specificArea: z.string(),
  role: z.string(),
  relevantSkills: z.array(z.string()).min(2).max(3),
  achievement: z.string(),
  portfolioLink: z.string(),
  githubLink: z.string(),
  linkedinLink: z.string(),
  senderName: z.string(),
});

export const coldDMSchema = z.object({
  recipientName: z.string(),
  companyName: z.string(),
  specificThing: z.string(),
  niche: z.string(),
  technologies: z.array(z.string()).min(2).max(3),
  projectAchievement: z.string(),
  role: z.string(),
});

export type ColdEmail = z.infer<typeof coldEmailSchema>;
export type ColdDM = z.infer<typeof coldDMSchema>;
