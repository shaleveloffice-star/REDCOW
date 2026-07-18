export type AdminRole = "owner" | "manager" | "editor";

export type AdminPermission =
  | "menu:write"
  | "branches:write"
  | "press:write"
  | "messages:read"
  | "careers:read"
  | "settings:write";

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  permissions: AdminPermission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminSession = {
  email: string;
  role: AdminRole;
  isMock: boolean;
};
