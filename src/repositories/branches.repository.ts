import { mockBranches } from "@/data/mock/branches.mock";
import type { Branch } from "@/types/content";

export async function getBranches(): Promise<Branch[]> {
  return mockBranches;
}

export async function getBranchById(id: string): Promise<Branch | null> {
  return mockBranches.find((branch) => branch.id === id) ?? null;
}

export async function saveBranch(input: Branch): Promise<Branch> {
  return input;
}
