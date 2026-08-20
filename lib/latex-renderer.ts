import type { Resume } from "@/lib/schemas/resume";
import { parseContactUrl } from "@/lib/contact-links";

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}]/g, (char) => `\\${char}`)
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/\*\*([^*]+)\*\*/g, "\\textbf{$1}");
}

function renderContactSection(contact: Resume["contact"]): string {
  const lines: string[] = [];

  lines.push("\\begin{center}");
  lines.push(
    "    {\\Huge \\scshape " + escapeLatex(contact.name) + "} \\\\ \\vspace{1pt}"
  );

  if (contact.address) {
    lines.push(
      "    " + escapeLatex(contact.address) + " \\\\ \\vspace{1pt}"
    );
  }

  const contactParts: string[] = [];
  if (contact.phone) {
    contactParts.push(
      "\\small \\raisebox{-0.1\\height}\\Telefon\\ " + escapeLatex(contact.phone)
    );
  }
  if (contact.email) {
    contactParts.push(
      "\\href{mailto:" + contact.email + "}{\\raisebox{-0.2\\height}\\Letter\\  \\uline{" + escapeLatex(contact.email) + "}}"
    );
  }

  const parsedLinkedin = parseContactUrl(contact.linkedin || "", "linkedin");
  if (parsedLinkedin.url) {
    contactParts.push(
      "\\href{" + parsedLinkedin.url + "}{\\uline{" + escapeLatex(parsedLinkedin.display) + "}}"
    );
  }

  const parsedGithub = parseContactUrl(contact.github || "", "github");
  if (parsedGithub.url) {
    contactParts.push(
      "\\href{" + parsedGithub.url + "}{\\uline{" + escapeLatex(parsedGithub.display) + "}}"
    );
  }

  if (contactParts.length > 0) {
    lines.push("    " + contactParts.join(" ~ "));
  }

  lines.push("    \\vspace{-8pt}");
  lines.push("\\end{center}");

  return lines.join("\n");
}

function renderEducationSection(education: Resume["education"]): string {
  const lines: string[] = [];

  lines.push("%-----------EDUCATION-----------");
  lines.push("\\section{Education}");
  lines.push("  \\resumeSubHeadingListStart");

  for (const edu of education) {
    lines.push("    \\resumeSubheading");
    lines.push(
      "      {" + escapeLatex(edu.institution) + "}{" + escapeLatex(edu.dateRange) + "}"
    );
    lines.push(
      "      {" + escapeLatex(edu.degree) + "}{" + (edu.location ? escapeLatex(edu.location) : "") + "}"
    );
  }

  lines.push("  \\resumeSubHeadingListEnd");

  return lines.join("\n");
}

function renderCourseworkSection(
  coursework: string[] | undefined
): string {
  if (!coursework || coursework.length === 0) return "";

  const lines: string[] = [];

  lines.push("%------RELEVANT COURSEWORK-------");
  lines.push("\\section{Relevant Coursework}");
  lines.push("        \\begin{multicols}{4}");
  lines.push("            \\begin{itemize}[itemsep=-5pt, parsep=3pt]");

  for (const course of coursework) {
    lines.push("                \\item\\small " + escapeLatex(course));
  }

  lines.push("            \\end{itemize}");
  lines.push("        \\end{multicols}");
  lines.push("        \\vspace*{2.0\\multicolsep}");

  return lines.join("\n");
}

function renderExperienceSection(
  experience: Resume["experience"]
): string {
  if (!experience || experience.length === 0) return "";

  const lines: string[] = [];

  lines.push("%-----------EXPERIENCE-----------");
  lines.push("\\section{Experience}");
  lines.push("  \\resumeSubHeadingListStart");

  for (const exp of experience) {
    lines.push("    \\resumeSubheading");
    lines.push(
      "      {" + escapeLatex(exp.company) + "}{" + escapeLatex(exp.dateRange) + "}"
    );
    lines.push(
      "      {" + escapeLatex(exp.position) + "}{" + (exp.location ? escapeLatex(exp.location) : "") + "}"
    );
    lines.push("      \\resumeItemListStart");

    for (const bullet of exp.bulletPoints) {
      lines.push("        \\resumeItem{" + escapeLatex(bullet) + "}");
    }

    lines.push("    \\resumeItemListEnd");
  }

  lines.push("  \\resumeSubHeadingListEnd");
  lines.push("\\vspace{-6pt}");

  return lines.join("\n");
}

function renderProjectsSection(projects: Resume["projects"]): string {
  if (!projects || projects.length === 0) return "";

  const lines: string[] = [];

  lines.push("%-----------PROJECTS-----------");
  lines.push("\\section{Projects}");
  lines.push("    \\vspace{-5pt}");
  lines.push("    \\resumeSubHeadingListStart");

  for (const project of projects) {
    const techPart = project.technologies
      ? " $|$ \\emph{" + escapeLatex(project.technologies) + "}"
      : "";
    const datePart = project.date
      ? "{" + escapeLatex(project.date) + "}"
      : "{}";

    lines.push("      \\resumeProjectHeading");
    lines.push(
      "          {\\textbf{" + escapeLatex(project.name) + "}" + techPart + "}" + datePart
    );
    lines.push("          \\resumeItemListStart");

    for (const bullet of project.bulletPoints) {
      lines.push("            \\resumeItem{" + escapeLatex(bullet) + "}");
    }

    lines.push("          \\resumeItemListEnd");
    lines.push("          \\vspace{-7pt}");
  }

  lines.push("    \\resumeSubHeadingListEnd");
  lines.push("\\vspace{3pt}");

  return lines.join("\n");
}

function renderSkillsSection(
  skills: Resume["technicalSkills"]
): string {
  if (!skills) return "";

  const lines: string[] = [];

  lines.push("%-----------PROGRAMMING SKILLS-----------");
  lines.push("\\section{Technical Skills}");
  lines.push(" \\begin{itemize}[leftmargin=0.15in, label={}]");
  lines.push("    \\small{\\item{");

  if (skills.languages && skills.languages.length > 0) {
    lines.push(
      "     \\textbf{Languages}{: " + escapeLatex(skills.languages.join(", ")) + "} \\\\"
    );
  }
  if (skills.developerTools && skills.developerTools.length > 0) {
    lines.push(
      "     \\textbf{Developer Tools}{: " + escapeLatex(skills.developerTools.join(", ")) + "} \\\\"
    );
  }
  if (
    skills.technologiesFrameworks &&
    skills.technologiesFrameworks.length > 0
  ) {
    lines.push(
      "     \\textbf{Technologies/Frameworks}{: " + escapeLatex(skills.technologiesFrameworks.join(", ")) + "} \\\\"
    );
  }

  lines.push("    }}");
  lines.push(" \\end{itemize}");
  lines.push(" \\vspace{-16pt}");

  return lines.join("\n");
}

function renderLeadershipSection(
  leadership: Resume["leadership"]
): string {
  if (!leadership || leadership.length === 0) return "";

  const lines: string[] = [];

  lines.push("%-----------INVOLVEMENT---------------");
  lines.push("\\section{Leadership / Extracurricular}");
  lines.push("    \\resumeSubHeadingListStart");

  for (const entry of leadership) {
    lines.push(
      "        \\resumeSubheading{" + escapeLatex(entry.organization) + "}{" + escapeLatex(entry.dateRange) + "}{" + escapeLatex(entry.position) + "}{" + (entry.location ? escapeLatex(entry.location) : "") + "}"
    );
    lines.push("            \\resumeItemListStart");

    for (const bullet of entry.bulletPoints) {
      lines.push("                \\resumeItem{" + escapeLatex(bullet) + "}");
    }

    lines.push("            \\resumeItemListEnd");
  }

  lines.push("    \\resumeSubHeadingListEnd");

  return lines.join("\n");
}

const PREAMBLE = [
  "%-------------------------",
  "% Resume in Latex",
  "% Author : Generated by Fuck My Resume",
  "% License : MIT",
  "%------------------------",
  "",
  "\\documentclass[letterpaper,11pt]{article}",
  "",
  "\\usepackage{latexsym}",
  "\\usepackage[empty]{fullpage}",
  "\\usepackage{titlesec}",
  "\\usepackage{marvosym}",
  "\\usepackage[usenames,dvipsnames]{color}",
  "\\usepackage{verbatim}",
  "\\usepackage{enumitem}",
  "\\usepackage[hidelinks]{hyperref}",
  "\\usepackage{fancyhdr}",
  "\\usepackage[english]{babel}",
  "\\usepackage{tabularx}",
  "\\usepackage[normalem]{ulem}",
  "\\usepackage{iftex}",
  "\\usepackage{multicol}",
  "\\setlength{\\multicolsep}{-3.0pt}",
  "\\setlength{\\columnsep}{-1pt}",
  "\\ifPDFTeX",
  "  \\input{glyphtounicode}",
  "  \\pdfgentounicode=1",
  "\\fi",
  "",
  "\\pagestyle{fancy}",
  "\\fancyhf{} % clear all header and footer fields",
  "\\fancyfoot{}",
  "\\renewcommand{\\headrulewidth}{0pt}",
  "\\renewcommand{\\footrulewidth}{0pt}",
  "",
  "% Adjust margins",
  "\\addtolength{\\oddsidemargin}{-0.6in}",
  "\\addtolength{\\evensidemargin}{-0.5in}",
  "\\addtolength{\\textwidth}{1.19in}",
  "\\addtolength{\\topmargin}{-.7in}",
  "\\addtolength{\\textheight}{1.4in}",
  "",
  "\\urlstyle{same}",
  "",
  "\\raggedbottom",
  "\\raggedright",
  "\\setlength{\\tabcolsep}{0in}",
  "",
  "% Sections formatting",
  "\\titleformat{\\section}{",
  "  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries",
  "}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]",
  "",
  "%-------------------------",
  "% Custom commands",
  "\\newcommand{\\resumeItem}[1]{",
  "  \\item\\small{",
  "    {#1 \\vspace{-2pt}}",
  "  }",
  "}",
  "",
  "\\newcommand{\\classesList}[4]{",
  "    \\item\\small{",
  "        {#1 #2 #3 #4 \\vspace{-2pt}}",
  "  }",
  "}",
  "",
  "\\newcommand{\\resumeSubheading}[4]{",
  "  \\vspace{-2pt}\\item",
  "    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}",
  "      \\textbf{#1} & \\textbf{\\small #2} \\\\",
  "      \\textit{\\small#3} & \\textit{\\small #4} \\\\",
  "    \\end{tabular*}\\vspace{-7pt}",
  "}",
  "",
  "\\newcommand{\\resumeSubSubheading}[2]{",
  "    \\item",
  "    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}",
  "      \\textit{\\small#1} & \\textit{\\small #2} \\\\",
  "    \\end{tabular*}\\vspace{-7pt}",
  "}",
  "",
  "\\newcommand{\\resumeProjectHeading}[2]{",
  "    \\item",
  "    \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}",
  "      \\small#1 & \\textbf{\\small #2}\\\\",
  "    \\end{tabular*}\\vspace{-7pt}",
  "}",
  "",
  "\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}",
  "",
  "\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}",
  "\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}",
  "",
  "\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}",
  "\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}",
  "\\newcommand{\\resumeItemListStart}{\\begin{itemize}}",
  "\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}",
  "",
  "%-------------------------------------------",
  "%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%",
  "",
  "",
  "\\begin{document}",
].join("\n");

export function generateLatex(resume: Resume): string {
  const sections: string[] = [];

  sections.push(PREAMBLE);
  sections.push(renderContactSection(resume.contact));
  sections.push(renderEducationSection(resume.education));
  sections.push(renderCourseworkSection(resume.relevantCoursework));
  sections.push(renderExperienceSection(resume.experience));
  sections.push(renderProjectsSection(resume.projects));
  sections.push(renderSkillsSection(resume.technicalSkills));
  sections.push(renderLeadershipSection(resume.leadership));
  sections.push("\\end{document}");

  return sections.join("\n\n");
}
