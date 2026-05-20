import { mockCareerApplications } from "@/data/mock/contact.mock";
import { createInMemoryStore } from "@/lib/admin/in-memory-store";
import type { CareerApplication } from "@/types/content";

const careersStore = createInMemoryStore(mockCareerApplications);

export async function getCareerApplications(): Promise<CareerApplication[]> {
  return careersStore.getAll();
}

export async function saveCareerApplication(input: CareerApplication): Promise<CareerApplication> {
  return careersStore.save(input);
}

export async function deleteCareerApplication(id: string): Promise<boolean> {
  return careersStore.remove(id);
}
