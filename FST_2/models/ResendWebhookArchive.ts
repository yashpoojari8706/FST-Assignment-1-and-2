import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResendWebhookArchive extends Document {
  providerEventId: string;
  providerMessageId?: string;
  eventType: string;
  recipient?: string;
  tenantId?: string;
  rawBody: string;
  parsedPayload: Record<string, unknown>;
  processingStatus: "PROCESSED" | "DUPLICATE" | "FAILED" | "UNSUPPORTED";
  errorMessage?: string;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResendWebhookArchiveSchema = new Schema<IResendWebhookArchive>(
  {
    providerEventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    providerMessageId: {
      type: String,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    recipient: {
      type: String,
    },
    tenantId: {
      type: String,
      index: true,
    },
    rawBody: {
      type: String,
      required: true,
    },
    parsedPayload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    processingStatus: {
      type: String,
      enum: ["PROCESSED", "DUPLICATE", "FAILED", "UNSUPPORTED"],
      default: "PROCESSED",
      index: true,
    },
    errorMessage: {
      type: String,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model across Next.js hot reloads
export const ResendWebhookArchive: Model<IResendWebhookArchive> =
  mongoose.models.ResendWebhookArchive ||
  mongoose.model<IResendWebhookArchive>("ResendWebhookArchive", ResendWebhookArchiveSchema);

export default ResendWebhookArchive;
