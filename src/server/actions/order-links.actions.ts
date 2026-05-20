"use server";

import { revalidatePath } from "next/cache";
import { listOrderLinks, removeOrderLink, upsertOrderLink } from "@/services/order-links.service";
import type { OrderLink } from "@/types/content";

const paths = ["/admin/order-links", "/"];

export async function getOrderLinksAdminData() {
  return listOrderLinks();
}

export async function saveOrderLinkAction(input: OrderLink) {
  if (!input.label.trim()) throw new Error("שם הקישור נדרש");
  if (!input.url.trim()) throw new Error("כתובת URL נדרשת");
  const saved = await upsertOrderLink({
    ...input,
    label: input.label.trim(),
    url: input.url.trim(),
    isActive: Boolean(input.isActive)
  });
  paths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function deleteOrderLinkAction(id: string) {
  const ok = await removeOrderLink(id);
  if (!ok) throw new Error("הקישור לא נמצא");
  paths.forEach((path) => revalidatePath(path));
}
