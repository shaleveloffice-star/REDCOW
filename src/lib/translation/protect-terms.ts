const PROTECTED_PATTERNS: RegExp[] = [
  /\bNB BURGER\b/gi,
  /https?:\/\/[^\s]+/gi,
  /\/(?:images|menu|icons|apple-touch-icon|favicon)[^\s"'<>]*/gi,
  /₪\s?\d+(?:[.,]\d+)?/g,
  /\d+(?:[.,]\d+)?\s?₪/g,
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
];

type ProtectedSegment = {
  placeholder: string;
  original: string;
};

export function shouldSkipTranslation(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^[a-z0-9-]+$/i.test(trimmed)) return true;
  if (/^\d+(?:[.,]\d+)?$/.test(trimmed)) return true;
  return false;
}

export function protectTranslatableText(text: string): { protectedText: string; segments: ProtectedSegment[] } {
  let protectedText = text;
  const segments: ProtectedSegment[] = [];

  for (const pattern of PROTECTED_PATTERNS) {
    protectedText = protectedText.replace(pattern, (match) => {
      const placeholder = `__NBX_${segments.length}__`;
      segments.push({ placeholder, original: match });
      return placeholder;
    });
  }

  return { protectedText, segments };
}

export function restoreProtectedText(text: string, segments: ProtectedSegment[]): string {
  return segments.reduce(
    (current, segment) => current.replaceAll(segment.placeholder, segment.original),
    text
  );
}
