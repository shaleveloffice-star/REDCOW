/** Split markdown/plain text into non-empty paragraphs (blank line separated). */
export function splitParagraphs(value?: string | null): string[] {
  return String(value ?? "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinParagraphs(paragraphs: string[]): string {
  return paragraphs.filter((part) => part.trim()).join("\n\n");
}
