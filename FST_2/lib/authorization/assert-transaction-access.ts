import prisma from "@/lib/prisma";
import { AuthError } from "./require-session";
import { requireTenantAccess } from "./tenant-access";
import { Permission } from "./permissions";

export async function assertTransactionAccess(
  transactionId: string,
  requiredPermission: Permission = "transaction:read"
) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      tenant: true,
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new AuthError("Transaction not found", 404, "NOT_FOUND");
  }

  // Strictly verify tenant boundary & permission
  const tenantContext = await requireTenantAccess(transaction.tenantId, requiredPermission);

  return {
    transaction,
    tenantContext,
  };
}
