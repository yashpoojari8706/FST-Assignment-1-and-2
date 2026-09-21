"use server";

import {
  checkoutFormSchema,
  CheckoutFormData,
  CheckoutActionResponse,
} from "@/lib/validation/checkout-schema";

interface ServerCartItemPayload {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface ServerCheckoutPayload {
  formData: CheckoutFormData;
  cartItems: ServerCartItemPayload[];
}

export async function processCheckoutAction(
  payload: ServerCheckoutPayload
): Promise<CheckoutActionResponse> {
  // 1. Validate payload existence
  if (!payload || !payload.formData) {
    return {
      success: false,
      message: "Invalid submission: Missing form data payload.",
    };
  }

  // 2. Server-side string normalization & sanitization (trimming, whitespace collapse, safe casing)
  const normalizedFormData: CheckoutFormData = {
    fullName: payload.formData.fullName?.trim().replace(/\s+/g, " ") || "",
    email: payload.formData.email?.trim().toLowerCase() || "",
    phone: payload.formData.phone?.trim().replace(/\s+/g, " ") || "",
    address: payload.formData.address?.trim().replace(/\s+/g, " ") || "",
    city: payload.formData.city?.trim().replace(/\s+/g, " ") || "",
    postalCode: payload.formData.postalCode?.trim().toUpperCase() || "",
    orderNote: payload.formData.orderNote?.trim().replace(/\s+/g, " ") || undefined,
  };

  // 3. Strict Server-side Zod validation using the shared schema
  const validationResult = checkoutFormSchema.safeParse(normalizedFormData);

  if (!validationResult.success) {
    const formattedErrors: Record<string, string[]> = {};
    for (const issue of validationResult.error.issues) {
      const field = issue.path[0] as string;
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(issue.message);
    }

    return {
      success: false,
      message: "Server validation failed. Please check the provided inputs.",
      errors: formattedErrors,
    };
  }

  // 4. Cart payload validation
  if (!payload.cartItems || payload.cartItems.length === 0) {
    return {
      success: false,
      message: "Cannot checkout with an empty shopping cart.",
    };
  }

  // Verify cart item quantities and prices are positive numbers
  const totalItemCount = payload.cartItems.reduce(
    (sum, item) => sum + (Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 0),
    0
  );

  const subtotal = payload.cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (totalItemCount === 0 || subtotal <= 0) {
    return {
      success: false,
      message: "Invalid cart payload structure or totals.",
    };
  }

  const tax = subtotal * 0.08;
  const shipping = subtotal >= 100 ? 0 : 12;
  const totalAmount = subtotal + tax + shipping;

  // 5. Simulate asynchronous mutation / order fulfillment (no DB, pure server execution)
  await new Promise((resolve) => setTimeout(resolve, 350));

  // Generate deterministic/unique structured order reference
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

  return {
    success: true,
    message: "Your order has been successfully placed and processed!",
    orderId,
    timestamp: new Date().toISOString(),
    summary: {
      itemCount: totalItemCount,
      totalAmount: Math.round(totalAmount * 100) / 100,
      customerName: validationResult.data.fullName,
      customerEmail: validationResult.data.email,
    },
  };
}
