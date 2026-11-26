"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import { revalidatePath, updateTag } from "next/cache";
import { listBranches, removeBranch, upsertBranch } from "@/services/branches.service";
import type { Branch } from "@/types/content";

const paths = ["/admin/branches", "/locations", "/", "/about", "/kosher", "/menu"];

function revalidateBranches() {
  try {
    updateTag(CACHE_TAGS.branches);
  } catch {
    // ignore older runtimes
  }
  paths.forEach((path) => revalidatePath(path));
}

export async function getBranchesAdminData() {
  await requireAdmin();
  return listBranches();
}

export async function saveBranchAction(input: Branch) {
  await requireAdmin();
  if (!input.name.trim()) throw new Error("שם הסניף נדרש");
  if (!input.city.trim()) throw new Error("עיר הסניף נדרשת");
  if (!input.address.trim()) throw new Error("כתובת הסניף נדרשת");

  const saved = await upsertBranch({
    ...input,
    name: input.name.trim(),
    city: input.city.trim(),
    address: input.address.trim(),
    phone: input.phone.trim(),
    openingHours: input.openingHours.trim(),
    wazeUrl: assertSafeHttpUrl(input.wazeUrl, "קישור Google Maps"),
    isActive: input.isActive !== false
  });
  revalidateBranches();
  return saved;
}

export async function deleteBranchAction(id: string) {
  await requireAdminRole(["owner", "manager"]);
  const ok = await removeBranch(id);
  if (!ok) throw new Error("הסניף לא נמצא");
  revalidateBranches();
}
