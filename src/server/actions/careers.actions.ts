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

const paths = ["/admin/career-applications"];

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
  const saved = await upsertCareerApplication({
    ...input,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    desiredRole: input.desiredRole.trim(),
    message: input.message.trim(),
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
