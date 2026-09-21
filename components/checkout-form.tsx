"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  checkoutFormSchema,
  CheckoutFormData,
  CheckoutActionResponse,
} from "@/lib/validation/checkout-schema";
import { processCheckoutAction } from "@/actions/checkout";
import {
  useCartStore,
  selectCartItems,
  selectCartTotal,
  selectHasHydrated,
} from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

export function CheckoutForm() {
  const items = useCartStore(selectCartItems);
  const total = useCartStore(selectCartTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const hasHydrated = useCartStore(selectHasHydrated);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionResult, setSubmissionResult] =
    React.useState<CheckoutActionResponse | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      orderNote: "",
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error("Cart is empty", {
        description: "Please add products before submitting checkout.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      // Prepare payload with serializable data
      const payload = {
        formData: data,
        cartItems: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        })),
      };

      // Invoke the Next.js Server Action
      const response = await processCheckoutAction(payload);

      setSubmissionResult(response);

      if (response.success) {
        toast.success("Order confirmed!", {
          description: `Order ID: ${response.orderId}`,
        });
        clearCart();
        reset();
      } else {
        toast.error("Submission failed", {
          description: response.message,
        });
      }
    } catch {
      const fallbackResponse: CheckoutActionResponse = {
        success: false,
        message: "An unexpected network or server error occurred. Please try again.",
      };
      setSubmissionResult(fallbackResponse);
      toast.error("Network Error", {
        description: "Could not reach the server. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Success confirmation state
  if (submissionResult?.success) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Order Confirmed!
          </CardTitle>
          <CardDescription className="text-sm">
            Thank you for shopping with ShopFlow. Your order is being prepped.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <div className="rounded-lg border bg-card p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs uppercase font-mono tracking-wider">
                Order Reference
              </span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                <span>{submissionResult.orderId}</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Recipient:</span>
                <p className="font-semibold text-foreground">
                  {submissionResult.summary?.customerName}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Confirmation sent to:</span>
                <p className="font-semibold text-foreground truncate">
                  {submissionResult.summary?.customerEmail}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Items Ordered:</span>
                <p className="font-semibold text-foreground">
                  {submissionResult.summary?.itemCount} items
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Paid:</span>
                <p className="font-semibold text-primary">
                  {formatPrice(submissionResult.summary?.totalAmount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="gap-2">
              <Link href="/">
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => setSubmissionResult(null)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Place Another Order
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. Disabled/Empty cart state
  if (hasHydrated && items.length === 0) {
    return (
      <Card className="border-muted bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Customer Information</CardTitle>
          <CardDescription>
            Your cart is currently empty. Please add items to enable checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/40 border text-center text-sm text-muted-foreground">
            No items in cart to checkout.
          </div>
          <Button asChild className="w-full">
            <Link href="/">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 3. Interactive checkout form
  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Shipping & Details</CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>
        <CardDescription>
          Please enter your delivery information for order dispatch.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* General server error alert */}
        {submissionResult && !submissionResult.success && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{submissionResult.message}</p>
              {submissionResult.errors && (
                <ul className="list-disc list-inside mt-1 text-xs space-y-0.5">
                  {Object.entries(submissionResult.errors).map(([field, msgs]) => (
                    <li key={field}>
                      <span className="capitalize">{field}</span>: {msgs.join(", ")}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-semibold">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="e.g. Yash Lad"
              autoComplete="name"
              hasError={!!errors.fullName}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              {...register("fullName")}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p
                id="fullName-error"
                role="alert"
                className="text-xs text-destructive font-medium"
              >
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                hasError={!!errors.email}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="text-xs text-destructive font-medium"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555-0199"
                autoComplete="tel"
                hasError={!!errors.phone}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                {...register("phone")}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p
                  id="phone-error"
                  role="alert"
                  className="text-xs text-destructive font-medium"
                >
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Street Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              placeholder="123 Innovation Way, Suite 400"
              autoComplete="street-address"
              hasError={!!errors.address}
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? "address-error" : undefined}
              {...register("address")}
              disabled={isSubmitting}
            />
            {errors.address && (
              <p
                id="address-error"
                role="alert"
                className="text-xs text-destructive font-medium"
              >
                {errors.address.message}
              </p>
            )}
          </div>

          {/* City & Postal Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs font-semibold">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="San Francisco"
                autoComplete="address-level2"
                hasError={!!errors.city}
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? "city-error" : undefined}
                {...register("city")}
                disabled={isSubmitting}
              />
              {errors.city && (
                <p
                  id="city-error"
                  role="alert"
                  className="text-xs text-destructive font-medium"
                >
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="postalCode" className="text-xs font-semibold">
                Postal / ZIP Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="postalCode"
                placeholder="94107"
                autoComplete="postal-code"
                hasError={!!errors.postalCode}
                aria-invalid={!!errors.postalCode}
                aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
                {...register("postalCode")}
                disabled={isSubmitting}
              />
              {errors.postalCode && (
                <p
                  id="postalCode-error"
                  role="alert"
                  className="text-xs text-destructive font-medium"
                >
                  {errors.postalCode.message}
                </p>
              )}
            </div>
          </div>

          {/* Order Note (Optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="orderNote" className="text-xs font-semibold">
              Delivery Instructions / Order Note{" "}
              <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="orderNote"
              placeholder="e.g. Leave package by front porch door"
              hasError={!!errors.orderNote}
              aria-invalid={!!errors.orderNote}
              aria-describedby={errors.orderNote ? "orderNote-error" : undefined}
              {...register("orderNote")}
              disabled={isSubmitting}
            />
            {errors.orderNote && (
              <p
                id="orderNote-error"
                role="alert"
                className="text-xs text-destructive font-medium"
              >
                {errors.orderNote.message}
              </p>
            )}
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full h-11 text-base font-semibold shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Validating & Processing Order...</span>
                </>
              ) : (
                <span>Complete Order ({formatPrice(total)})</span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
