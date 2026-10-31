"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { revalidatePath } from "next/cache";
import {
  createCareerApplication,
  listCareerApplications,
  removeCareerApplication,
  upsertCareerApplication
} from "@/services/careers.service";
import type { CareerApplication, RecordStatus } from "@/types/content";
import { parseCareerApplication, type CareerApplicationResult } from "@/lib/careers/validation";
import { RATE_LIMITS } from "@/lib/constants";
import { consumeRateLimitAsync, getRequestClientIp } from "@/lib/security/rate-limit";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getAdminFirestore } from "@/lib/firebase/admin-runtime";

const paths = ["/admin/career-applications"];

export async function submitCareerApplicationAction(formData: FormData): Promise<CareerApplicationResult> {
  const unavailable = { success: false as const, message: "לא ניתן לשלוח כרגע. נסו שוב בעוד כמה דקות." };
  try {
    if (formData.get("website")) return unavailable;
    const parsed = parseCareerApplication(formData);
    if (!parsed.ok) return { success: false, fieldErrors: parsed.fieldErrors };
    if (process.env.NODE_ENV === "production" && (!isFirebaseConfigured() || !(await getAdminFirestore()))) return unavailable;
    const ip = await getRequestClientIp();
    if (!(await consumeRateLimitAsync(`careers:${ip}`, RATE_LIMITS.contact.maxAttempts, RATE_LIMITS.contact.windowMs))) return unavailable;
    await createCareerApplication({ ...parsed.value, email: "", desiredRole: "צוות המסעדה", message: "" });
  } catch {
    console.error("[Careers] application submission failed");
    return unavailable;
  }
  try { revalidatePath("/admin/career-applications"); } catch { /* Already persisted; do not encourage a duplicate submission. */ }
  return { success: true };
}

export async function getCareerApplicationsAdminData() {
  await requireAdmin();
  return listCareerApplications();
}

export async function createCareerApplicationAction(formData: FormData) {
  await requireAdmin();
  return createCareerApplication({
    fullName: String(formData.get("fullName") ?? "").trim().slice(0, 120),
    phone: String(formData.get("phone") ?? "").trim().slice(0, 40),
    email: String(formData.get("email") ?? "").trim().slice(0, 254),
    desiredRole: String(formData.get("desiredRole") ?? "").trim().slice(0, 120),
    message: String(formData.get("message") ?? "").trim().slice(0, 5000)
  });
}

export async function saveCareerApplicationAction(input: CareerApplication) {
  await requireAdmin();
  if (!input.fullName.trim()) throw new Error("שם נדרש");
  if (input.age !== undefined && (!Number.isInteger(input.age) || input.age < 1 || input.age > 120)) throw new Error("גיל לא תקין");
  if (input.hasExperience !== undefined && typeof input.hasExperience !== "boolean") throw new Error("ניסיון קודם לא תקין");
  const saved = await upsertCareerApplication({
    ...input,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    desiredRole: input.desiredRole.trim(),
    message: input.message.trim(),
    ...(input.residenceArea !== undefined ? { residenceArea: input.residenceArea.trim().slice(0, 120) } : {}),
    status: input.status as RecordStatus
  });
  paths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function deleteCareerApplicationAction(id: string) {
  await requireAdminRole(["owner", "manager"]);
  const ok = await removeCareerApplication(id);
  if (!ok) throw new Error("הפנייה לא נמצאה");
  paths.forEach((path) => revalidatePath(path));
}
