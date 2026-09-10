export function createId(prefix: string): string {
  const slug = prefix.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "item";
  return `${slug}-${globalThis.crypto.randomUUID()}`;
}
