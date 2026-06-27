import { mockCareerApplications } from "@/data/mock/contact.mock";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localCareerApplicationsStore } from "@/lib/firebase/local-stores";
import type { CareerApplication } from "@/types/content";

const careersStore = createFirestoreCollectionStore(
  "careerApplications",
  localCareerApplicationsStore,
  mockCareerApplications
);

export async function getCareerApplications(): Promise<CareerApplication[]> {
  return careersStore.getAll();
}

export async function saveCareerApplication(input: CareerApplication): Promise<CareerApplication> {
  return careersStore.save(input);
}

export async function deleteCareerApplication(id: string): Promise<boolean> {
  return careersStore.remove(id);
}
