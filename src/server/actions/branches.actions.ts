"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import { revalidatePath } from "next/cache";
import { listBranches, removeBranch, upsertBranch } from "@/services/branches.service";
import type { Branch } from "@/types/content";

const paths = ["/admin/branches", "/branches", "/"];

export async function getBranchesAdminData() {
  await requireAdmin();
  return listBranches();
}

export async function saveBranchAction(input: Branch) {
  await requireAdmin();
  if (!input.name.trim()) throw new Error("שם הסניף נדרש");
  const saved = await upsertBranch({
    ...input,
    name: input.name.trim(),
    city: input.city.trim(),
    address: input.address.trim(),
    phone: input.phone.trim(),
    openingHours: input.openingHours.trim(),
    wazeUrl: assertSafeHttpUrl(input.wazeUrl, "קישור Waze"),
    isActive: Boolean(input.isActive)
  });
  paths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function deleteBranchAction(id: string) {
  await requireAdminRole(["owner", "manager"]);
  const ok = await removeBranch(id);
  if (!ok) throw new Error("הסניף לא נמצא");
  paths.forEach((path) => revalidatePath(path));
}
