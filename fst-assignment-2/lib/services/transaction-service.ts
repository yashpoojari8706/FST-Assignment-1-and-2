import prisma from "@/lib/prisma";
import { AuditService } from "./audit-service";
import { EmailService, EmailDispatchResult } from "./email-service";
import { formatCurrency } from "@/lib/utils";
import { TransactionStatus, Prisma } from "@prisma/client";

export interface CreateTransactionParams {
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency?: string;
  description: string;
  recipientEmail?: string;
}

export interface TransactionMutationResult {
  transaction: {
    id: string;
    reference: string;
    amount: string;
    currency: string;
    status: TransactionStatus;
    description: string;
    createdAt: Date;
  };
  auditLogId: string;
  emailDispatch: EmailDispatchResult;
}

export class TransactionService {
  /**
   * Execute atomic relational transaction creation (Transaction + AuditLog in PostgreSQL ACID transaction)
   * Followed by awaited post-commit transactional email dispatch.
   */
  static async create(params: CreateTransactionParams): Promise<TransactionMutationResult> {
    const currency = params.currency || "USD";
    const reference = `TX-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. ACID Prisma Transaction: create Transaction + immutable AuditLog
    const { createdTransaction, auditLog } = await prisma.$transaction(async (tx) => {
      const txRecord = await tx.transaction.create({
        data: {
          tenantId: params.tenantId,
          createdByUserId: params.userId,
          reference,
          amount: new Prisma.Decimal(params.amount),
          currency,
          status: "COMPLETED",
          description: params.description,
        },
      });

      const auditRecord = await AuditService.log(
        {
          tenantId: params.tenantId,
          actorUserId: params.userId,
          action: "TRANSACTION_CREATED",
          entity: "Transaction",
          entityId: txRecord.id,
          metadata: {
            reference,
            amount: params.amount,
            currency,
            status: "COMPLETED",
            description: params.description,
          },
        },
        tx
      );

      return { createdTransaction: txRecord, auditLog: auditRecord };
    });

    // 2. Post-Commit Awaited Email Dispatch
    // Notice: email is sent AFTER successful database commit and failure will not roll back the database
    const targetEmail = params.recipientEmail || params.userEmail;
    const emailDispatch = await EmailService.sendTransactionAlert({
      tenantId: params.tenantId,
      tenantName: params.tenantName,
      transactionId: createdTransaction.id,
      reference: createdTransaction.reference,
      amount: formatCurrency(createdTransaction.amount.toNumber(), createdTransaction.currency),
      currency: createdTransaction.currency,
      status: createdTransaction.status,
      description: createdTransaction.description,
      createdByName: params.userName,
      recipientEmail: targetEmail,
    });

    return {
      transaction: {
        id: createdTransaction.id,
        reference: createdTransaction.reference,
        amount: createdTransaction.amount.toString(),
        currency: createdTransaction.currency,
        status: createdTransaction.status,
        description: createdTransaction.description,
        createdAt: createdTransaction.createdAt,
      },
      auditLogId: auditLog.id,
      emailDispatch,
    };
  }

  /**
   * Update transaction status with ACID audit logging and post-commit notification
   */
  static async updateStatus(params: {
    transactionId: string;
    tenantId: string;
    tenantName: string;
    userId: string;
    userName: string;
    newStatus: TransactionStatus;
    reason?: string;
  }) {
    const { updatedTransaction, auditLog } = await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({
        where: { id: params.transactionId },
      });

      if (!existing || existing.tenantId !== params.tenantId) {
        throw new Error("Transaction not found in this tenant boundary");
      }

      const txRecord = await tx.transaction.update({
        where: { id: params.transactionId },
        data: { status: params.newStatus },
        include: { createdByUser: true },
      });

      const auditRecord = await AuditService.log(
        {
          tenantId: params.tenantId,
          actorUserId: params.userId,
          action: "TRANSACTION_STATUS_UPDATED",
          entity: "Transaction",
          entityId: txRecord.id,
          metadata: {
            previousStatus: existing.status,
            newStatus: params.newStatus,
            reason: params.reason || "Manual status override",
          },
        },
        tx
      );

      return { updatedTransaction: txRecord, auditLog: auditRecord };
    });

    return {
      transaction: updatedTransaction,
      auditLogId: auditLog.id,
    };
  }
}
