import type { AdminImageSpec } from "@/data/admin-image-specs";
import { compressAdminImage } from "@/lib/client/compress-image";

export async function uploadCompressedAdminImage(
  file: File,
  spec?: AdminImageSpec
): Promise<{ url: string; fileName?: string }> {
  const dataUrl = await compressAdminImage(file, {
    maxBytes: spec?.maxBytes,
    maxEdge: spec?.maxEdge
  });

  const response = await fetch("/api/admin/gallery-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ dataUrl })
  });

  const result = (await response.json()) as
    | { ok: true; url: string; fileName?: string }
    | { ok: false; error: string };

  if (!response.ok || !result.ok) {
    throw new Error("error" in result ? result.error : "העלאה נכשלה");
  }

  return { url: result.url, fileName: result.fileName };
}
