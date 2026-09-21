import { RoleName } from "@prisma/client";

export type Permission =
  | "transaction:read"
  | "transaction:create"
  | "transaction:update"
  | "audit:read"
  | "tenant:manage";

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  ADMIN: [
    "transaction:read",
    "transaction:create",
    "transaction:update",
    "audit:read",
    "tenant:manage",
  ],
  MEMBER: [
    "transaction:read",
    "transaction:create",
    "transaction:update",
  ],
  GUEST: [
    "transaction:read",
  ],
};

export function hasPermission(role: RoleName, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
