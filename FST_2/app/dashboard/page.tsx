import { requireTenantAccess, getUserTenants } from "@/lib/authorization/tenant-access";
import { requireSession } from "@/lib/authorization/require-session";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Database, Shield, Lock, Layers, ArrowUpRight, Cpu, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { RoleName } from "@prisma/client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await requireSession();
  const memberships = await getUserTenants(session.user.id);

  if (memberships.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-[#0c0f14]">
        <div className="neo-panel p-6 max-w-md">
          <div className="text-xs font-mono-tech text-[#57677e] mb-2">AUTH ERROR // NO_MEMBERSHIPS</div>
          <h2 className="text-base font-bold text-[#e6edf3]">No Tenant Memberships Found</h2>
          <p className="text-[#8b9bb4] text-xs mt-2 font-mono-tech">
            Execute <code>npm run db:reset-seed</code> to populate relational organizations.
          </p>
        </div>
      </div>
    );
  }

  const { tenantId: queryTenantId } = await searchParams;
  const activeTenantId = queryTenantId || memberships[0].tenantId;

  // Authoritative server-side verification of tenant membership & active role
  const tenantContext = await requireTenantAccess(activeTenantId);

  // Tenant metrics
  const totalTxCount = await prisma.transaction.count({
    where: { tenantId: activeTenantId },
  });

  const completedTxCount = await prisma.transaction.count({
    where: { tenantId: activeTenantId, status: "COMPLETED" },
  });

  const pendingTxCount = await prisma.transaction.count({
    where: { tenantId: activeTenantId, status: "PENDING" },
  });

  const recentTransactions = await prisma.transaction.findMany({
    where: { tenantId: activeTenantId },
    include: { createdByUser: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const recentAuditLogs =
    tenantContext.role === "ADMIN"
      ? await prisma.auditLog.findMany({
          where: { tenantId: activeTenantId },
          include: { actorUser: true },
          orderBy: { createdAt: "desc" },
          take: 6,
        })
      : [];

  const tenantList = memberships.map((m) => ({
    id: m.tenantId,
    name: m.tenant.name,
    slug: m.tenant.slug,
    role: m.role.name as RoleName,
  }));

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
        {/* Console Header Bar */}
        <div className="neo-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono-tech text-[#57677e] uppercase tracking-wider">
              OPERATIONAL CONTEXT // SCOPED TENANT BOUNDARY
            </div>
            <h1 className="text-xl font-bold text-[#e6edf3] font-mono-tech mt-0.5 flex items-center gap-2">
              <span>{tenantContext.tenantName}</span>
              <span className="text-xs bg-[#18202c] border border-[#232d3d] text-[#8b9bb4] px-2 py-0.5 rounded font-mono-tech">
                SLUG:{tenantContext.tenantSlug}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="neo-badge neo-badge-neutral">
              CLEARANCE: {tenantContext.role}
            </div>
            <Link
              href={`/dashboard/transactions?tenantId=${activeTenantId}`}
              className="neo-button-primary px-3 py-1.5 flex items-center gap-1.5 font-mono-tech"
            >
              <Layers className="w-3.5 h-3.5" /> ACCESS LEDGER
            </Link>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="neo-panel p-4">
            <div className="text-[10px] font-mono-tech text-[#57677e] font-bold">TOTAL TRANSACTIONS</div>
            <div className="text-2xl font-bold font-mono-tech text-[#e6edf3] mt-2">{totalTxCount}</div>
            <div className="text-[10px] text-[#57677e] font-mono-tech mt-1">Tenant isolated count</div>
          </div>

          <div className="neo-panel p-4">
            <div className="text-[10px] font-mono-tech text-[#57677e] font-bold">COMMITTED (ACID)</div>
            <div className="text-2xl font-bold font-mono-tech text-emerald-400 mt-2">{completedTxCount}</div>
            <div className="text-[10px] text-[#57677e] font-mono-tech mt-1">Post-commit dispatched</div>
          </div>

          <div className="neo-panel p-4">
            <div className="text-[10px] font-mono-tech text-[#57677e] font-bold">PENDING SETTLEMENT</div>
            <div className="text-2xl font-bold font-mono-tech text-amber-400 mt-2">{pendingTxCount}</div>
            <div className="text-[10px] text-[#57677e] font-mono-tech mt-1">Awaiting batch verification</div>
          </div>

          <div className="neo-panel p-4">
            <div className="text-[10px] font-mono-tech text-[#57677e] font-bold">DATABASE TOPOLOGY</div>
            <div className="text-xs font-mono-tech text-[#00d2ff] mt-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> DUAL-PERSISTENCE
            </div>
            <div className="text-[10px] text-[#57677e] font-mono-tech mt-1">Postgres ACID + Mongo Archive</div>
          </div>
        </div>

        {/* Architecture Pipeline Status Banner */}
        <div className="neo-panel p-3 bg-[#0e131b]">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono-tech text-[#8b9bb4]">
            <span className="flex items-center gap-1.5 text-[#e6edf3] font-bold">
              <Cpu className="w-3.5 h-3.5 text-[#00d2ff]" /> PIPELINE ARCHITECTURE:
            </span>
            <span>1. Node Proxy Gate</span>
            <span className="text-[#3b495e]">→</span>
            <span>2. Better Auth Session</span>
            <span className="text-[#3b495e]">→</span>
            <span>3. Scoped RBAC Engine</span>
            <span className="text-[#3b495e]">→</span>
            <span>4. Prisma PostgreSQL ACID</span>
            <span className="text-[#3b495e]">→</span>
            <span>5. Awaited Resend Dispatch</span>
            <span className="text-[#3b495e]">→</span>
            <span>6. Mongoose Mongo Archive</span>
          </div>
        </div>

        {/* Modular Tables: Transaction Monitor & Security Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Monitor */}
          <div className="neo-panel overflow-hidden">
            <div className="neo-panel-header flex items-center justify-between">
              <span>TRANSACTION MONITOR</span>
              <Link
                href={`/dashboard/transactions?tenantId=${activeTenantId}`}
                className="text-[10px] text-[#00d2ff] hover:underline flex items-center gap-0.5"
              >
                EXPAND <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="neo-table">
                <thead>
                  <tr>
                    <th>REFERENCE</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>OPERATOR</th>
                    <th>TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="font-mono-tech text-xs">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="text-[#00d2ff] font-bold">{tx.reference}</td>
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
                      <td className="text-[#8b9bb4]">{tx.createdByUser.name.split(" ")[0]}</td>
                      <td className="text-[#57677e] text-[11px]">{formatDate(tx.createdAt)}</td>
                    </tr>
                  ))}
                  {recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-[#57677e]">
                        NO TRANSACTION RECORDS DETECTED
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Audit Trail */}
          <div className="neo-panel overflow-hidden">
            <div className="neo-panel-header flex items-center justify-between">
              <span>SECURITY AUDIT TRAIL</span>
              {tenantContext.role === "ADMIN" && (
                <Link
                  href={`/dashboard/audit-logs?tenantId=${activeTenantId}`}
                  className="text-[10px] text-[#00d2ff] hover:underline flex items-center gap-0.5"
                >
                  EXPAND <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {tenantContext.role === "ADMIN" ? (
              <div className="overflow-x-auto">
                <table className="neo-table">
                  <thead>
                    <tr>
                      <th>ACTION</th>
                      <th>ENTITY</th>
                      <th>ACTOR</th>
                      <th>TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono-tech text-xs">
                    {recentAuditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="text-purple-300 font-bold">{log.action}</td>
                        <td className="text-[#8b9bb4]">{log.entity}</td>
                        <td className="text-[#e6edf3]">{log.actorUser.name.split(" ")[0]}</td>
                        <td className="text-[#57677e] text-[11px]">{formatDate(log.createdAt)}</td>
                      </tr>
                    ))}
                    {recentAuditLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-[#57677e]">
                          NO AUDIT EVENTS LOGGED
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#0e131b]">
                <div className="neo-badge neo-badge-danger mb-2">ACCESS RESTRICTED</div>
                <p className="text-xs font-mono-tech text-[#8b9bb4]">
                  Security Audit Trail requires <strong>ADMIN</strong> clearance.
                </p>
                <div className="text-[10px] font-mono-tech text-[#57677e] mt-1">
                  CURRENT CLEARANCE: {tenantContext.role} (READ-DENIED)
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
