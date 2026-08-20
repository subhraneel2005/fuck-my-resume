import * as pdfjsLib from "pdfjs-dist";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => item.str)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str as string)
      .join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n");
}

export interface ContactLinks {
  linkedin?: string;
  github?: string;
}

// Extracts the real hyperlink targets (link annotations) for the contact
// section. PDFs often display a short/sanitized text ("linkedin.com/in/user")
// while the actual link points elsewhere (".../user-123456/"), and text
// extraction only sees the displayed string - so the real URL is read from the
// annotations instead.
export async function extractContactLinksFromPDF(file: File): Promise<ContactLinks> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const links: ContactLinks = {};

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const annotations = await page.getAnnotations();
    for (const annotation of annotations) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const url = (annotation as any).url as string | undefined;
      if (!url) continue;

      if (!links.linkedin && /linkedin\.com\/in\//i.test(url)) {
        links.linkedin = url;
      } else if (!links.github && /github\.com\//i.test(url)) {
        links.github = url;
      }
    }

    if (links.linkedin && links.github) break;
  }

  return links;
}
