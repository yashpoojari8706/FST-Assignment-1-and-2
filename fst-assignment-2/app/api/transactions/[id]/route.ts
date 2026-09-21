import { NextRequest, NextResponse } from "next/server";
import { assertTransactionAccess } from "@/lib/authorization/assert-transaction-access";
import { AuthError } from "@/lib/authorization/require-session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { transaction } = await assertTransactionAccess(id, "transaction:read");

    return NextResponse.json({
      success: true,
      data: transaction,
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
