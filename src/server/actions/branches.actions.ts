"use server";

import { revalidatePath } from "next/cache";
import { listBranches, removeBranch, upsertBranch } from "@/services/branches.service";
import type { Branch } from "@/types/content";

const paths = ["/admin/branches", "/"];

export async function getBranchesAdminData() {
  return listBranches();
}

export async function saveBranchAction(input: Branch) {
  if (!input.name.trim()) throw new Error("שם הסניף נדרש");
  const saved = await upsertBranch({
    ...input,
    name: input.name.trim(),
    city: input.city.trim(),
    address: input.address.trim(),
    phone: input.phone.trim(),
    openingHours: input.openingHours.trim(),
    wazeUrl: input.wazeUrl.trim(),
    isActive: Boolean(input.isActive)
  });
  paths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function deleteBranchAction(id: string) {
  const ok = await removeBranch(id);
  if (!ok) throw new Error("הסניף לא נמצא");
  paths.forEach((path) => revalidatePath(path));
}
