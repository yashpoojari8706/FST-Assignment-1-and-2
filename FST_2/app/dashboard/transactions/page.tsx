import { requireTenantAccess, getUserTenants } from "@/lib/authorization/tenant-access";
import { requireSession } from "@/lib/authorization/require-session";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { CreateTransactionModal } from "@/components/transactions/CreateTransactionModal";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Mail, AlertTriangle, Database } from "lucide-react";
import { RoleName } from "@prisma/client";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await requireSession();
  const memberships = await getUserTenants(session.user.id);

  const { tenantId: queryTenantId } = await searchParams;
  const activeTenantId = queryTenantId || memberships[0]?.tenantId;

  // Authoritative check: must have at least transaction:read permission
  const tenantContext = await requireTenantAccess(activeTenantId, "transaction:read");

  const transactions = await prisma.transaction.findMany({
    where: { tenantId: activeTenantId },
    include: {
      createdByUser: true,
      emailEvents: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const tenantList = memberships.map((m) => ({
    id: m.tenantId,
    name: m.tenant.name,
    slug: m.tenant.slug,
    role: m.role.name as RoleName,
  }));

  const canCreate = tenantContext.role === "ADMIN" || tenantContext.role === "MEMBER";

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0f14]">
      <DashboardNav
        user={{
          name: session.user.name || "Operator",
          email: session.user.email,
        }}
        tenants={tenantList}
        activeTenantId={activeTenantId}
        activeRole={tenantContext.role}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6 flex-1">
        {/* Ledger Header Panel */}
        <div className="neo-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono-tech text-[#57677e] uppercase">
              POSTGRESQL RELATIONAL LEDGER // TENANT: {tenantContext.tenantSlug}
            </div>
            <h1 className="text-xl font-bold text-[#e6edf3] font-mono-tech mt-0.5">
              TRANSACTION AUDIT & SETTLEMENT MONITOR
            </h1>
          </div>

          <div>
            {canCreate ? (
              <CreateTransactionModal
                tenantId={activeTenantId}
                userEmail={session.user.email}
              />
            ) : (
              <div className="neo-badge neo-badge-warning">
                <AlertTriangle className="w-3 h-3" />
                <span>GUEST CLEARANCE: MUTATION DISABLED BY RBAC</span>
              </div>
            )}
          </div>
        </div>

        {/* Transactions Table Console */}
        <div className="neo-panel overflow-hidden">
          <div className="neo-panel-header flex items-center justify-between">
            <span>RELATIONAL TRANSACTION DATASET ({transactions.length} RECORDS)</span>
            <span className="text-[10px] font-mono-tech text-[#57677e]">TABLE: transaction</span>
          </div>
          <div className="overflow-x-auto">
            <table className="neo-table">
              <thead>
                <tr>
                  <th>REFERENCE ID</th>
                  <th>DESCRIPTION</th>
                  <th>AMOUNT</th>
                  <th>STATE</th>
                  <th>OPERATOR</th>
                  <th>NOTIFICATION LIFECYCLE</th>
                  <th>TIMESTAMP (UTC)</th>
                </tr>
              </thead>
              <tbody className="font-mono-tech text-xs">
                {transactions.map((tx) => {
                  const emailEvent = tx.emailEvents[0];
                  return (
                    <tr key={tx.id}>
                      <td className="text-[#00d2ff] font-bold">{tx.reference}</td>
                      <td className="text-[#e6edf3]">{tx.description}</td>
                      <td className="font-bold text-[#e6edf3]">
                        {formatCurrency(tx.amount.toNumber(), tx.currency)}
                      </td>
                      <td>
                        <span
                          className={`neo-badge ${
                            tx.status === "COMPLETED"
                              ? "neo-badge-success"
                              : tx.status === "PENDING"
                              ? "neo-badge-warning"
                              : "neo-badge-danger"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="text-[#8b9bb4]">{tx.createdByUser.name}</td>
                      <td>
                        {emailEvent ? (
                          <span className="neo-badge neo-badge-neutral">
                            <Mail className="w-3 h-3 text-[#00d2ff]" />
                            {emailEvent.eventType} [{emailEvent.source}]
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#57677e]">UNNOTIFIED</span>
                        )}
                      </td>
                      <td className="text-[#57677e] text-[11px]">{formatDate(tx.createdAt)}</td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#57677e]">
                      NO TRANSACTION RECORDS EXIST FOR THIS TENANT BOUNDARY
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
