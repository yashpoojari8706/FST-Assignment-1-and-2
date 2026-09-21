import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface CreateAuditLogParams {
  tenantId: string;
  actorUserId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  /**
   * Log an immutable application-level security and business audit event
   */
  static async log(params: CreateAuditLogParams, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.auditLog.create({
      data: {
        tenantId: params.tenantId,
        actorUserId: params.actorUserId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: (params.metadata || {}) as Prisma.InputJsonValue,
      },
      include: {
        actorUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Fetch audit logs scoped to a specific tenant
   */
  static async getTenantAuditLogs(tenantId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { tenantId },
      include: {
        actorUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
