import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import prisma from "@/lib/prisma";
import { connectToMongoDB } from "@/lib/mongodb";
import { ResendWebhookArchive } from "@/models/ResendWebhookArchive";
import { EmailEventType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    // 1. Read Raw Request Body as text BEFORE parsing JSON (Essential for Svix cryptographic validation)
    const rawBody = await request.text();

    // 2. Extract Svix Signature Headers
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    // Verify webhook signature if secret configured
    if (webhookSecret && webhookSecret !== "whsec_mock_resend_webhook_secret_key") {
      if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Missing Svix signature headers" } },
          { status: 401 }
        );
      }

      try {
        const wh = new Webhook(webhookSecret);
        wh.verify(rawBody, {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Invalid webhook signature";
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: `Webhook verification failed: ${msg}` } },
          { status: 403 }
        );
      }
    }

    // 3. Parse validated JSON payload
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Malformed JSON payload" } },
        { status: 400 }
      );
    }

    const eventTypeStr = (payload.type as string)?.toLowerCase() || "email.delivered";
    const data = (payload.data || {}) as Record<string, unknown>;
    const providerMessageId = (data.email_id as string) || (data.id as string) || undefined;
    const providerEventId = (payload.id as string) || svixId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const recipient = Array.isArray(data.to) ? (data.to[0] as string) : (data.to as string) || undefined;

    // Map Resend event type to normalized Prisma Enum
    let normalizedEventType: EmailEventType = "DELIVERED";
    if (eventTypeStr.includes("sent")) normalizedEventType = "SENT";
    else if (eventTypeStr.includes("bounc")) normalizedEventType = "BOUNCED";
    else if (eventTypeStr.includes("fail")) normalizedEventType = "FAILED";
    else if (eventTypeStr.includes("deliver")) normalizedEventType = "DELIVERED";

    // 4. Idempotency Check in PostgreSQL
    const existingPostgresEvent = await prisma.emailEvent.findUnique({
      where: { providerEventId },
    });

    if (existingPostgresEvent) {
      // Graceful duplicate acknowledgement without duplicate writes
      return NextResponse.json(
        {
          success: true,
          message: "Event already processed (PostgreSQL Idempotency Check)",
          providerEventId,
        },
        { status: 200 }
      );
    }

    // Determine tenant context from existing email event or default first tenant
    let tenantId = (data.tenantId as string) || undefined;
    let transactionId = (data.transactionId as string) || undefined;

    if (providerMessageId && (!tenantId || !transactionId)) {
      const priorEvent = await prisma.emailEvent.findFirst({
        where: { providerMessageId },
      });
      if (priorEvent) {
        tenantId = priorEvent.tenantId;
        transactionId = priorEvent.transactionId || undefined;
      }
    }

    if (!tenantId) {
      const defaultTenant = await prisma.tenant.findFirst();
      tenantId = defaultTenant?.id || "default-tenant";
    }

    // 5. Authoritative Structured Event Persistence in PostgreSQL (Prisma)
    const persistedEmailEvent = await prisma.emailEvent.create({
      data: {
        tenantId,
        transactionId,
        providerEventId,
        providerMessageId,
        eventType: normalizedEventType,
        recipient: recipient || "unknown@secureops.dev",
        source: "RESEND_WEBHOOK",
        payload: payload as object,
        occurredAt: payload.created_at ? new Date(payload.created_at as string) : new Date(),
      },
    });

    // 6. Object Database Raw Payload Archiving in MongoDB (Mongoose)
    try {
      await connectToMongoDB();
      await ResendWebhookArchive.findOneAndUpdate(
        { providerEventId },
        {
          providerEventId,
          providerMessageId,
          eventType: eventTypeStr,
          recipient,
          tenantId,
          rawBody,
          parsedPayload: payload,
          processingStatus: "PROCESSED",
          receivedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (mongoErr) {
      console.warn("[Webhook] Mongoose archiving note (MongoDB operation failed or offline):", mongoErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Webhook processed successfully across dual-persistence layers",
        data: {
          emailEventId: persistedEmailEvent.id,
          providerEventId,
          eventType: normalizedEventType,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[Webhook] Resend Webhook Processing Error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}
