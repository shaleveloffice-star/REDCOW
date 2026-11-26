import {
  getBusinessHoursText,
  isLegacyBusinessHours,
  normalizeBranchLocation
} from "@/data/business";
import { mockBranches } from "@/data/mock/branches.mock";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localBranchesStore } from "@/lib/firebase/local-stores";
import type { Branch } from "@/types/content";

const branchesStore = createFirestoreCollectionStore("branches", localBranchesStore, {
  access: "public",
  seed: mockBranches
});

export async function getBranches(): Promise<Branch[]> {
  return (await branchesStore.getAll()).map(normalizeBranchRecord);
}

export async function getBranchById(id: string): Promise<Branch | null> {
  const branch = await branchesStore.getById(id);
  return branch ? normalizeBranchRecord(branch) : null;
}

export async function saveBranch(input: Branch): Promise<Branch> {
  return branchesStore.save(normalizeBranchRecord(input));
}

export async function deleteBranch(id: string): Promise<boolean> {
  return branchesStore.remove(id);
}

function normalizeBranchRecord(branch: Branch): Branch {
  const withLocation = normalizeBranchLocation(branch);
  return isLegacyBusinessHours(withLocation.openingHours)
    ? { ...withLocation, openingHours: getBusinessHoursText() }
    : withLocation;
}
