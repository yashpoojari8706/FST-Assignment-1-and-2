import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess } from "@/lib/authorization/tenant-access";
import { CreateTransactionSchema } from "@/lib/validation";
import { TransactionService } from "@/lib/services/transaction-service";
import prisma from "@/lib/prisma";
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

    // Authoritative check: must belong to tenant with transaction:read permission
    await requireTenantAccess(tenantId, "transaction:read");

    const transactions = await prisma.transaction.findMany({
      where: { tenantId },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: transactions,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateTransactionSchema.parse(body);

    // Authoritative check: must have transaction:create permission
    const tenantContext = await requireTenantAccess(validated.tenantId, "transaction:create");

    const user = await prisma.user.findUnique({
      where: { id: tenantContext.userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

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

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }
    const message = error instanceof Error ? error.message : "Validation or Internal Server Error";
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message } },
      { status: 400 }
    );
  }
}
