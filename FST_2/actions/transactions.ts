"use server";

import { requireTenantAccess } from "@/lib/authorization/tenant-access";
import { CreateTransactionSchema, UpdateTransactionStatusSchema } from "@/lib/validation";
import { TransactionService } from "@/lib/services/transaction-service";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createTransactionAction(formData: {
  tenantId: string;
  amount: number;
  currency?: string;
  description: string;
  recipientEmail?: string;
}) {
  try {
    // 1. Authoritative Backend Authorization: verify active session & role permission
    const tenantContext = await requireTenantAccess(formData.tenantId, "transaction:create");

    // 2. Runtime Payload Validation
    const validated = CreateTransactionSchema.parse(formData);

    // Fetch user details for notification
    const user = await prisma.user.findUnique({
      where: { id: tenantContext.userId },
      select: { name: true, email: true },
    });

    if (!user) {
      throw new Error("User record not found");
    }

    // 3. Execute Service (ACID Transaction + Post-commit Email Dispatch)
    const result = await TransactionService.create({
      tenantId: tenantContext.tenantId,
      tenantName: tenantContext.tenantName,
      userId: tenantContext.userId,
      userName: user.name,
      userEmail: user.email,
      amount: validated.amount,
      currency: validated.currency,
      description: validated.description,
      recipientEmail: validated.recipientEmail,
    });

    // 4. Revalidate cache
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create transaction";
    return {
      success: false,
      error: {
        message,
      },
    };
  }
}

export async function updateTransactionStatusAction(formData: {
  tenantId: string;
  transactionId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  reason?: string;
}) {
  try {
    const tenantContext = await requireTenantAccess(formData.tenantId, "transaction:update");
    const validated = UpdateTransactionStatusSchema.parse(formData);

    const user = await prisma.user.findUnique({
      where: { id: tenantContext.userId },
      select: { name: true },
    });

    const result = await TransactionService.updateStatus({
      transactionId: validated.transactionId,
      tenantId: tenantContext.tenantId,
      tenantName: tenantContext.tenantName,
      userId: tenantContext.userId,
      userName: user?.name || "Authorized User",
      newStatus: validated.status,
      reason: validated.reason,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update transaction status";
    return {
      success: false,
      error: {
        message,
      },
    };
  }
}
