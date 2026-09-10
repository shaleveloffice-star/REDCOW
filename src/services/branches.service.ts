import { cache } from "react";
import { deleteBranch, getBranches, saveBranch } from "@/repositories/branches.repository";
import type { Branch } from "@/types/content";

export async function listBranches(options: { activeOnly?: boolean } = {}): Promise<Branch[]> {
  const branches = await getBranches();
  return branches.filter((branch) => (options.activeOnly ? branch.isActive : true));
}

export async function upsertBranch(input: Branch): Promise<Branch> {
  return saveBranch({ ...input, updatedAt: new Date().toISOString() });
}

export async function removeBranch(id: string): Promise<boolean> {
  return deleteBranch(id);
}

export const getPrimaryBranch = cache(async (): Promise<Branch | undefined> => (await listBranches({ activeOnly: true }))[0]);
