import { mockBranches } from "@/data/mock/branches.mock";
import { createInMemoryStore } from "@/lib/admin/in-memory-store";
import type { Branch } from "@/types/content";

const branchesStore = createInMemoryStore(mockBranches);

export async function getBranches(): Promise<Branch[]> {
  return branchesStore.getAll();
}

export async function getBranchById(id: string): Promise<Branch | null> {
  return branchesStore.getById(id);
}

export async function saveBranch(input: Branch): Promise<Branch> {
  return branchesStore.save(input);
}

export async function deleteBranch(id: string): Promise<boolean> {
  return branchesStore.remove(id);
}
