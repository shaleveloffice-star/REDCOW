"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { getMenuHeroConfig, saveMenuHeroConfig } from "@/repositories/menu-hero.repository";
import type { MenuHeroInput } from "@/types/menu-hero";

export async function getMenuHeroAdminData() {
  await requireAdmin();
  return getMenuHeroConfig();
}

export async function saveMenuHeroAction(input: MenuHeroInput) {
  await requireAdmin();
  const saved = await saveMenuHeroConfig(input);
  updateTag(CACHE_TAGS.menuHero);
  revalidatePath("/menu");
  revalidatePath("/admin/menu");
  return saved;
}
