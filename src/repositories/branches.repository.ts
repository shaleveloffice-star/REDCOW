import { getBusinessHoursText, isLegacyBusinessHours } from "@/data/business";
import { mockBranches } from "@/data/mock/branches.mock";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localBranchesStore } from "@/lib/firebase/local-stores";
import type { Branch } from "@/types/content";

const branchesStore = createFirestoreCollectionStore("branches", localBranchesStore, {
  access: "public",
  seed: mockBranches
});

export async function getBranches(): Promise<Branch[]> {
  return (await branchesStore.getAll()).map(withCurrentDefaultHours);
}

export async function getBranchById(id: string): Promise<Branch | null> {
  const branch = await branchesStore.getById(id);
  return branch ? withCurrentDefaultHours(branch) : null;
}

export async function saveBranch(input: Branch): Promise<Branch> {
  return branchesStore.save(input);
}

export async function deleteBranch(id: string): Promise<boolean> {
  return branchesStore.remove(id);
}

function withCurrentDefaultHours(branch: Branch): Branch {
  return isLegacyBusinessHours(branch.openingHours)
    ? { ...branch, openingHours: getBusinessHoursText() }
    : branch;
}
