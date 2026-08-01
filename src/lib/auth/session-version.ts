import { createHash } from "crypto";

import { getAdminPassword } from "@/lib/auth/auth-config";

/** Changes when admin password changes — embedded in JWT to invalidate old sessions. */
export function getAdminSessionAuthVersion(): string | null {
  const password = getAdminPassword();
  if (!password) {
    return null;
  }

  return createHash("sha256").update(password).digest("hex").slice(0, 16);
}
