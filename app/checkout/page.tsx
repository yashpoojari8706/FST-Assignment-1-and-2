import { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
import { CheckoutSummary } from "@/components/checkout-summary";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout | ShopFlow",
  description:
    "Type-safe checkout process powered by React Hook Form, shared Zod validation, and Next.js Server Actions.",
};

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-6xl">
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Product Catalog
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          <span>SSL End-to-End Secure</span>
        </div>
      </div>

      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Order Checkout
        </h1>
        <p className="text-sm text-muted-foreground">
          End-to-End Type-Safe Mutation Flow (React Hook Form &rarr; Zod Schema &rarr; Server Action).
        </p>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Checkout Form (Client Component) */}
        <div className="lg:col-span-7">
          <CheckoutForm />
        </div>

        {/* Right: Cart Summary Breakdown (Client Component with selective Zustand subscriptions) */}
        <div className="lg:col-span-5 sticky top-24">
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
}
