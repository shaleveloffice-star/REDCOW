// Keep proxy and server session guards on the same password/config rules.
// auth-config has no Node-only imports; this compatibility module is edge-safe.
import { assertAdminAuthConfigured } from "@/lib/auth/auth-config";
export { ADMIN_SESSION_COOKIE, getAdminSessionSecret, getAdminPassword } from "@/lib/auth/auth-config";
export function assertEdgeProductionAuthConfig() { assertAdminAuthConfigured(); }
