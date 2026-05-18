"use server";

import { listBranches, upsertBranch } from "@/services/branches.service";
import type { Branch } from "@/types/content";

export async function getBranchesAdminData() {
  return listBranches();
}

export async function saveBranchAction(input: Branch) {
  return upsertBranch(input);
}
