"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import { revalidatePath, updateTag } from "next/cache";
import { listOrderLinks, removeOrderLink, upsertOrderLink } from "@/services/settings.service";
import type { OrderLink } from "@/types/content";

const paths = ["/admin/order-links", "/"];

export async function getOrderLinksAdminData() {
  await requireAdmin();
  return listOrderLinks();
}

export async function saveOrderLinkAction(input: OrderLink) {
  await requireAdmin();
  if (!input.label.trim()) throw new Error("שם הקישור נדרש");
  if (!input.url.trim()) throw new Error("כתובת URL נדרשת");
  const saved = await upsertOrderLink({
    ...input,
    label: input.label.trim(),
    url: assertSafeHttpUrl(input.url, "קישור הזמנה"),
    isActive: Boolean(input.isActive)
  });
  paths.forEach((path) => revalidatePath(path));
  updateTag(CACHE_TAGS.orderLinksActive);
  return saved;
}

export async function deleteOrderLinkAction(id: string) {
  await requireAdminRole(["owner", "manager"]);
  const ok = await removeOrderLink(id);
  if (!ok) throw new Error("הקישור לא נמצא");
  paths.forEach((path) => revalidatePath(path));
  updateTag(CACHE_TAGS.orderLinksActive);
}
