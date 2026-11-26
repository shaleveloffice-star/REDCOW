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

function sanitizeMapsUrl(value: string): string {
  const trimmed = assertSafeHttpUrl(value, "קישור Google Maps");
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    // Drop tracking noise from shared Google Maps links.
    for (const key of ["entry", "g_ep", "skid", "utm_source", "utm_medium", "utm_campaign"]) {
      url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return trimmed;
  }
}

export async function saveBranchAction(input: Branch) {
  await requireAdmin();
  if (!input.name.trim()) throw new Error("שם הסניף נדרש");
  if (!input.city.trim()) throw new Error("עיר הסניף נדרשת");
  if (!input.address.trim()) throw new Error("כתובת הסניף נדרשת");

  const imageUrl = assertSafeHttpUrl(String(input.imageUrl ?? ""), "תמונת סניף");
  const saved = await upsertBranch({
    ...input,
    name: input.name.trim(),
    city: input.city.trim(),
    address: input.address.trim(),
    phone: input.phone.trim(),
    openingHours: input.openingHours.trim(),
    wazeUrl: sanitizeMapsUrl(input.wazeUrl),
    ...(imageUrl ? { imageUrl } : { imageUrl: undefined }),
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
