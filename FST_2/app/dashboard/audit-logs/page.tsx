import { requireTenantAccess, getUserTenants } from "@/lib/authorization/tenant-access";
import { requireSession } from "@/lib/authorization/require-session";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { AuditService } from "@/lib/services/audit-service";
import { formatDate } from "@/lib/utils";
import { RoleName } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await requireSession();
  const memberships = await getUserTenants(session.user.id);

  const { tenantId: queryTenantId } = await searchParams;
  const activeTenantId = queryTenantId || memberships[0]?.tenantId;

  // Authoritative check: ONLY ADMIN can view audit logs
  let tenantContext;
  try {
    tenantContext = await requireTenantAccess(activeTenantId, "audit:read");
  } catch {
    redirect("/unauthorized");
  }

  const logs = await AuditService.getTenantAuditLogs(activeTenantId, 100);

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
        {/* Audit Header Panel */}
        <div className="neo-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono-tech text-[#57677e] uppercase">
              SECURITY OPERATIONS // AUDIT TRAIL
            </div>
            <h1 className="text-xl font-bold text-[#e6edf3] font-mono-tech mt-0.5">
              IMMUTABLE SECURITY & MUTATION LOGS
            </h1>
          </div>

          <div className="neo-badge neo-badge-neutral">
            ADMIN CLEARANCE VERIFIED // AUDIT_READ
          </div>
        </div>

        {/* Audit Logs Table Console */}
        <div className="neo-panel overflow-hidden">
          <div className="neo-panel-header flex items-center justify-between">
            <span>AUDIT EVENT STREAM ({logs.length} EVENTS)</span>
            <span className="text-[10px] font-mono-tech text-[#57677e]">TABLE: audit_log</span>
          </div>
          <div className="overflow-x-auto">
            <table className="neo-table">
              <thead>
                <tr>
                  <th>ACTION CODE</th>
                  <th>TARGET ENTITY</th>
                  <th>ENTITY ID</th>
                  <th>ACTOR / OPERATOR</th>
                  <th>METADATA PAYLOAD</th>
                  <th>TIMESTAMP (UTC)</th>
                </tr>
              </thead>
              <tbody className="font-mono-tech text-xs">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-purple-300 font-bold">{log.action}</td>
                    <td className="text-[#8b9bb4]">{log.entity}</td>
                    <td className="text-[#57677e] text-[11px]">{log.entityId}</td>
                    <td className="text-[#e6edf3]">
                      <div>{log.actorUser.name}</div>
                      <div className="text-[10px] text-[#57677e]">{log.actorUser.email}</div>
                    </td>
                    <td className="text-[10px] text-[#8b9bb4] max-w-xs truncate font-mono-tech">
                      {JSON.stringify(log.metadata)}
                    </td>
                    <td className="text-[#57677e] text-[11px]">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#57677e]">
                      NO AUDIT LOGS RECORDED FOR THIS TENANT BOUNDARY
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
