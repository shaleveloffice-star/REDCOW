"use server";

import { createCareerApplication, listCareerApplications } from "@/services/careers.service";

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
