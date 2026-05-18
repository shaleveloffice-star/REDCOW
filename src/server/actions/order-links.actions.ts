"use server";

import { listOrderLinks, upsertOrderLink } from "@/services/order-links.service";
import type { OrderLink } from "@/types/content";

export async function getOrderLinksAdminData() {
  return listOrderLinks();
}

export async function saveOrderLinkAction(input: OrderLink) {
  return upsertOrderLink(input);
}
