import { mockCareerApplications } from "@/data/mock/contact.mock";
import type { CareerApplication } from "@/types/content";

export async function getCareerApplications(): Promise<CareerApplication[]> {
  return mockCareerApplications;
}

export async function saveCareerApplication(input: CareerApplication): Promise<CareerApplication> {
  return input;
}
