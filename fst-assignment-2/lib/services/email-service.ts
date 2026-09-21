import { resend } from "@/lib/resend";
import { TransactionAlertEmail } from "@/components/emails/TransactionAlertEmail";
import prisma from "@/lib/prisma";
import React from "react";

export interface SendTransactionEmailParams {
  tenantId: string;
  tenantName: string;
  transactionId: string;
  reference: string;
  amount: string;
  currency: string;
  status: string;
  description: string;
  createdByName: string;
  recipientEmail: string;
}

export interface EmailDispatchResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export class EmailService {
  /**
   * Post-Commit Resend transactional notification dispatch
   * Awaited after successful database transaction; will NOT compromise committed database state on failure.
   */
  static async sendTransactionAlert(
    params: SendTransactionEmailParams
  ): Promise<EmailDispatchResult> {
    try {
      const fromEmail = process.env.EMAIL_FROM || "SecureOps <notifications@resend.dev>";

      // Render React Email and call Resend API
      const response = await resend.emails.send({
        from: fromEmail,
        to: params.recipientEmail,
        subject: `[${params.tenantName}] Transaction Security Alert: ${params.reference}`,
        react: React.createElement(TransactionAlertEmail, {
          tenantName: params.tenantName,
          reference: params.reference,
          amount: params.amount,
          currency: params.currency,
          status: params.status,
          description: params.description,
          createdByName: params.createdByName,
          createdAt: new Date().toISOString(),
        }),
      });

      if (response.error) {
        console.warn("[EmailService] Resend API returned error:", response.error.message);
        return {
          success: false,
          error: response.error.message,
        };
      }

      const providerMessageId = response.data?.id;

      // Track the sent event in PostgreSQL if message ID returned
      if (providerMessageId) {
        try {
          await prisma.emailEvent.create({
            data: {
              tenantId: params.tenantId,
              transactionId: params.transactionId,
              providerEventId: `evt_dispatch_${providerMessageId}_${Date.now()}`,
              providerMessageId: providerMessageId,
              eventType: "SENT",
              recipient: params.recipientEmail,
              source: "RESEND_WEBHOOK",
              payload: {
                reference: params.reference,
                dispatchedAt: new Date().toISOString(),
              },
            },
          });
        } catch (dbErr) {
          console.warn("[EmailService] Could not persist initial SENT email_event record:", dbErr);
        }
      }

      return {
        success: true,
        providerMessageId: providerMessageId || undefined,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown email dispatch failure";
      console.warn("[EmailService] Failed to send email alert:", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
