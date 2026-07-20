"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { processMenuImageUpload, type ProcessMenuImageResult } from "@/lib/admin/save-menu-image";

export type UploadImageResult = ProcessMenuImageResult;

/** Kept for compatibility — prefer POST /api/admin/menu-image from the client. */
export async function uploadMenuImageAction(formData: FormData): Promise<UploadImageResult> {
  try {
    await requireAdmin();
  } catch (err) {
    const detail = err instanceof Error ? err.message : "";
    console.warn("[uploadMenuImageAction] auth failed:", detail);
    return {
      ok: false,
      error: "אין הרשאת אדמין להעלאת תמונה. התחברו מחדש ל־/admin/login"
    };
  }

  try {
    const value = formData.get("file");
    if (!value || typeof value === "string") {
      return { ok: false, error: "לא נבחר קובץ תמונה" };
    }

    const blob = value as Blob;
    if (typeof blob.arrayBuffer !== "function" || blob.size <= 0) {
      return { ok: false, error: "לא נבחר קובץ תמונה" };
    }

    const bytes = Buffer.from(await blob.arrayBuffer());
    return processMenuImageUpload(bytes);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    console.warn("[uploadMenuImageAction] failed:", detail);
    return { ok: false, error: "העלאת התמונה נכשלה. נסו שוב או רעננו את הדף." };
  }
}
