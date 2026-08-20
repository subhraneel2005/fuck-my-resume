import { generateText, Output } from "ai";
// import { openai } from "@ai-sdk/openai";
import { google } from '@ai-sdk/google';
import { resumeSchema, type Resume } from "@/lib/schemas/resume";

const SYSTEM_PROMPT = `You are an expert resume parser and ATS optimizer. Extract information from the provided resume text, structure it as JSON, and ENHANCE it to be comprehensive, detailed, and ATS-friendly.

CRITICAL RULES - DO NOT:
1. NEVER add companies, jobs, projects, skills, or experiences NOT in the resume text
2. NEVER add entries from the job description - it is ONLY for keyword tailoring
3. NEVER invent new bullet points - only expand and detail what exists
4. CONTACT LINKS: ALWAYS extract the linkedin and github URLs exactly as they appear and put the clean path in the linkedin/github fields. NEVER omit them, NEVER add or duplicate the domain (no "github.com/github.com/x" or "linkedin.com/in/linkedin.com/in/x"), NEVER invent a URL. A field like "github.com/subhraneel2005/nini" must become "subhraneel2005/nini", a URL like "https://www.linkedin.com/in/subhraneel" must become "subhraneel". If a URL is missing from the resume, use empty string "".
5. CONTACT FIELDS: phone must contain ONLY the phone number (digits, spaces, +, -). address must contain ONLY the location (city/state/country). email must be a bare email. Never leave stray labels, prefixes, or extra words in these fields (e.g. no "INT +91..." in the address, no trailing "B" in the phone).

ENHANCEMENT STRATEGY - DO THIS:
1. For EACH experience entry, produce exactly 5-6 detailed bullet points. If the original has fewer, split longer bullets into multiple specific points or expand with more context about technologies, scope, and impact.
2. For EACH project entry, produce exactly 4-5 detailed bullet points.
3. Each bullet point MUST be 1.5-2 lines long. Be specific and verbose. Include:
   - What was built/done (specific feature or system name)
   - Technologies and tools used (list them explicitly)
   - Scale and scope (team size, user count, data volume, codebase size)
   - Impact and results (performance improvements, time saved, metrics achieved)
4. Start EVERY bullet with a strong action verb: Architected, Engineered, Developed, Implemented, Designed, Deployed, Optimized, Streamlined, Automated, Led, Spearheaded, Integrated, Refactored, Spearheaded, Orchestrated
5. Add plausible metrics where reasonable: "reduced processing time by 40%", "handled 50K+ daily requests", "improved test coverage from 60% to 95%", "managed microservices serving 100K users"
6. When a job description is provided, weave relevant keywords from the JD into existing bullet points naturally
7. Include ALL technologies mentioned anywhere in the resume under technical skills - scan experience and projects for tools, frameworks, languages, databases, cloud services
8. For relevant coursework, include 6-8 courses if mentioned
9. BOLDING: In every bullet point, wrap the 1-3 most impactful words or short phrases in double asterisks (** **) - e.g. metrics ("**by 40%**", "**50K+ daily requests**"), key technologies ("**Python**", "**TensorFlow**"), or standout outcomes ("**Reduced**", "**Scaled to 100K users**"). Bold ONLY genuinely important words, never whole sentences, never verbs that appear in every bullet, and at most 1-3 bolded phrases per bullet. For projects, bold the project name only if it is a well-known project.

OUTPUT VOLUME (these are MINIMUMS, produce MORE if the source content supports it):
- Each experience: 5-6 substantial bullet points
- Each project: 4-5 substantial bullet points  
- Technical skills: 3 categories with all mentioned technologies
- Education: preserve all details
- Contact: preserve all details, use empty string "" for missing fields`;

const ai_model = google('gemini-3.5-flash');

export async function parseResumeWithLLM(
  resumeText: string,
  jobDescription?: string
): Promise<Resume> {
  const userMessage = jobDescription
    ? `RESUME TEXT:\n\n${resumeText}\n\n---\nJOB DESCRIPTION (for keyword tailoring ONLY - do NOT add new entries):\n\n${jobDescription}`
    : `RESUME TEXT:\n\n${resumeText}`;

  const { output } = await generateText({
    model: ai_model,
    instructions: SYSTEM_PROMPT,
    prompt: userMessage,
    output: Output.object({ schema: resumeSchema }),
  });

  return output;
}
