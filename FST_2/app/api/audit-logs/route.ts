import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess } from "@/lib/authorization/tenant-access";
import { AuditService } from "@/lib/services/audit-service";
import { AuthError } from "@/lib/authorization/require-session";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "Query parameter 'tenantId' is required." },
        },
        { status: 400 }
      );
    }

    // Authoritative check: Only users with 'audit:read' (ADMIN) can access audit logs
    await requireTenantAccess(tenantId, "audit:read");

    const logs = await AuditService.getTenantAuditLogs(tenantId, 100);

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}
