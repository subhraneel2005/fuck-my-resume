import type { ColdEmail, ColdDM } from "@/lib/schemas/outreach";

export function renderColdEmail(data: ColdEmail): string {
  const skills = data.relevantSkills.join(", ");

  return `Subject: Internship opportunity at ${data.companyName}

Body: Hi ${data.recipientName},

I came across ${data.companyName} and really liked ${data.specificThing}. I'm particularly interested in what you're building around ${data.specificArea}.

I'm a ${data.role} focused on ${skills}. Recently, I ${data.achievement}. I'd love to explore whether there's an opportunity to contribute to ${data.companyName} as a ${data.role}.

Would you be open to a quick chat, or should I apply through a specific channel?

Portfolio: ${data.portfolioLink}
GitHub: ${data.githubLink}
LinkedIn: ${data.linkedinLink}

Thanks,
${data.senderName}`;
}

export function renderColdDM(data: ColdDM): string {
  const techs = data.technologies.join(", ");

  return `Hi ${data.recipientName} — I came across ${data.companyName} and noticed you're working on ${data.specificThing}. I'm a ${data.niche} engineer working with ${techs}, and recently built ${data.projectAchievement}.

I'm currently looking for ${data.role} opportunities and would love to explore whether I could be a fit for your team.

Would you be open to connecting?`;
}
