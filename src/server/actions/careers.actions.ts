"use server";

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
  return listCareerApplications();
}

export async function createCareerApplicationAction(formData: FormData) {
  return createCareerApplication({
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    desiredRole: String(formData.get("desiredRole") ?? ""),
    message: String(formData.get("message") ?? "")
  });
}

export async function saveCareerApplicationAction(input: CareerApplication) {
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
  const ok = await removeCareerApplication(id);
  if (!ok) throw new Error("הפנייה לא נמצאה");
  paths.forEach((path) => revalidatePath(path));
}
