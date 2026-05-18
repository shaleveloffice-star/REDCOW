import { getBranches, saveBranch } from "@/repositories/branches.repository";
import type { Branch } from "@/types/content";

export async function listBranches(options: { activeOnly?: boolean } = {}): Promise<Branch[]> {
  const branches = await getBranches();
  return branches.filter((branch) => (options.activeOnly ? branch.isActive : true));
}

export async function upsertBranch(input: Branch): Promise<Branch> {
  return saveBranch({ ...input, updatedAt: new Date().toISOString() });
}
