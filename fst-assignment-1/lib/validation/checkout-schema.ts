import { z } from "zod";

export const checkoutFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters" })
    .max(80, { message: "Full name cannot exceed 80 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, {
      message: "Full name should only contain letters, spaces, hyphens, or apostrophes",
    }),

  email: z
    .string()
    .email({ message: "Please provide a valid email address (e.g. name@example.com)" })
    .max(120, { message: "Email cannot exceed 120 characters" }),

  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(18, { message: "Phone number cannot exceed 18 characters" })
    .regex(/^(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?[\d\s.-]{7,12}$/, {
      message: "Please provide a valid international or domestic phone format",
    }),

  address: z
    .string()
    .min(5, { message: "Street address must be at least 5 characters" })
    .max(150, { message: "Address cannot exceed 150 characters" }),

  city: z
    .string()
    .min(2, { message: "City name must be at least 2 characters" })
    .max(60, { message: "City name cannot exceed 60 characters" })
    .regex(/^[a-zA-Z\s.-]+$/, {
      message: "City name should only contain letters and standard punctuation",
    }),

  postalCode: z
    .string()
    .min(3, { message: "Postal code must be at least 3 characters" })
    .max(12, { message: "Postal code cannot exceed 12 characters" })
    .regex(/^[a-zA-Z0-9\s-]+$/, {
      message: "Postal code format is invalid",
    }),

  orderNote: z
    .string()
    .max(300, { message: "Order note cannot exceed 300 characters" })
    .optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

export interface CheckoutActionResponse {
  success: boolean;
  message: string;
  orderId?: string;
  timestamp?: string;
  errors?: Record<string, string[]>;
  summary?: {
    itemCount: number;
    totalAmount: number;
    customerName: string;
    customerEmail: string;
  };
}
