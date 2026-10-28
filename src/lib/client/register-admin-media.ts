function shouldRegisterInGallery(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return false;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return true;
  }
  // Local menu/gallery media served from the site.
  return (
    trimmed.startsWith("/images/") ||
    trimmed.startsWith("/api/media/") ||
    trimmed.startsWith("/api/admin/")
  );
}

/** Best-effort: list a pasted/external media URL in the admin gallery. */
export async function registerAdminMediaInGallery(
  url: string,
  title?: string
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = url.trim();
  if (!shouldRegisterInGallery(trimmed)) {
    return { ok: false, error: "skip" };
  }

  try {
    const response = await fetch("/api/admin/gallery-media/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ url: trimmed, title })
    });
    const result = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !result.ok) {
      return { ok: false, error: result.error || "רישום לגלריה נכשל" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "רישום לגלריה נכשל" };
  }
}
