import type { AdminUser } from "@/types/admin";

const now = "2026-05-17T07:00:00.000Z";

export const mockAdminUsers: AdminUser[] = [
  {
    id: "admin-owner",
    email: "admin@nbburger.co.il",
    displayName: "NB BURGER Admin",
    role: "owner",
    permissions: [
      "menu:write",
      "branches:write",
      "gallery:write",
      "press:write",
      "messages:read",
      "careers:read",
      "settings:write"
    ],
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];
