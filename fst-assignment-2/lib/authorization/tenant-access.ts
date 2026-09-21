import prisma from "@/lib/prisma";
import { AuthError, requireSession } from "./require-session";
import { hasPermission, Permission } from "./permissions";
import { RoleName } from "@prisma/client";

export interface TenantContext {
  userId: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  role: RoleName;
  membershipId: string;
}

export async function requireTenantAccess(
  tenantId: string,
  requiredPermission?: Permission
): Promise<TenantContext> {
  const session = await requireSession();
  const userId = session.user.id;

  // Authoritative check against relational database for membership & scoped role
  const membership = await prisma.membership.findUnique({
    where: {
      userId_tenantId: {
        userId,
        tenantId,
      },
    },
    include: {
      tenant: true,
      role: true,
    },
  });

  if (!membership) {
    throw new AuthError(
      "Forbidden: You are not a member of this tenant organization.",
      403,
      "TENANT_ACCESS_DENIED"
    );
  }

  const roleName = membership.role.name as RoleName;

  if (requiredPermission && !hasPermission(roleName, requiredPermission)) {
    throw new AuthError(
      `Forbidden: Role '${roleName}' lacks permission '${requiredPermission}' in this tenant.`,
      403,
      "INSUFFICIENT_PERMISSIONS"
    );
  }

  return {
    userId,
    tenantId: membership.tenantId,
    tenantName: membership.tenant.name,
    tenantSlug: membership.tenant.slug,
    role: roleName,
    membershipId: membership.id,
  };
}

export async function getUserTenants(userId: string) {
  return prisma.membership.findMany({
    where: { userId },
    include: {
      tenant: true,
      role: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
