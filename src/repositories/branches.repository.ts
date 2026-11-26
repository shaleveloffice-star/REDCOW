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
  const raw = await branchesStore.getAll();
  const normalized = raw.map(normalizeBranchRecord);

  // Persist address/map heals so admin + public stop drifting from typos like "אחוזה 9".
  for (let index = 0; index < raw.length; index += 1) {
    const before = raw[index];
    const after = normalized[index];
    if (
      before.address !== after.address ||
      before.city !== after.city ||
      before.wazeUrl !== after.wazeUrl ||
      before.openingHours !== after.openingHours
    ) {
      void branchesStore.save(after).catch((error) => {
        console.error("[branches] failed to persist normalized branch", after.id, error);
      });
    }
  }

  return normalized.sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.name.localeCompare(b.name, "he");
  });
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
