/**
 * Reads resume text out of a PDF or DOCX entirely in the browser. The file is
 * never uploaded: only text the user can see and edit ever leaves the tab, and
 * that text is encrypted before it is stored.
 */
export const ACCEPTED_RESUME_TYPES = ".pdf,.docx,.txt,.md";
export const MAX_RESUME_BYTES = 8 * 1024 * 1024;

function normalize(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function fromPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let index = 1; index <= doc.numPages; index += 1) {
    const page = await doc.getPage(index);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s{2,}/g, " "),
    );
  }
  await doc.destroy();
  return normalize(pages.join("\n\n"));
}

async function fromDocx(file: File): Promise<string> {
  // @ts-expect-error - the browser bundle ships without type declarations.
  const mammoth = await import("mammoth/mammoth.browser.js");
  const buffer = await file.arrayBuffer();
  const result = await (mammoth.default ?? mammoth).extractRawText({ arrayBuffer: buffer });
  return normalize(String(result.value ?? ""));
}

export async function extractResumeText(file: File): Promise<string> {
  if (file.size > MAX_RESUME_BYTES) {
    throw new Error("That file is larger than 8 MB. Try exporting a smaller copy.");
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return fromPdf(file);
  if (name.endsWith(".docx")) return fromDocx(file);
  if (name.endsWith(".txt") || name.endsWith(".md")) return normalize(await file.text());
  if (name.endsWith(".doc")) {
    throw new Error("Legacy .doc files are not supported. Save as .docx or PDF first.");
  }
  throw new Error("Upload a PDF, DOCX, or plain-text resume — or paste the text instead.");
}
