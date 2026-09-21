import { z } from "zod";

export const CreateTransactionSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  currency: z.string().min(3).max(3).default("USD"),
  description: z.string().min(3, "Description must be at least 3 characters").max(255),
  recipientEmail: z.string().email("Valid notification recipient email is required").optional(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

export const UpdateTransactionStatusSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]),
  reason: z.string().optional(),
});

export type UpdateTransactionStatusInput = z.infer<typeof UpdateTransactionStatusSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
