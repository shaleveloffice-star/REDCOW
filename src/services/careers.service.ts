import { getCareerApplications, saveCareerApplication } from "@/repositories/careers.repository";
import type { CareerApplication } from "@/types/content";

export async function listCareerApplications(): Promise<CareerApplication[]> {
  const applications = await getCareerApplications();
  return [...applications].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function createCareerApplication(
  input: Omit<CareerApplication, "id" | "createdAt" | "status">
): Promise<CareerApplication> {
  return saveCareerApplication({
    ...input,
    id: `career-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "new"
  });
}
