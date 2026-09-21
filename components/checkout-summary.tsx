"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCartStore,
  selectCartItems,
  selectCartItemCount,
  selectCartSubtotal,
  selectCartTax,
  selectCartShipping,
  selectCartTotal,
  selectHasHydrated,
} from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CheckoutSummary() {
  const items = useCartStore(selectCartItems);
  const itemCount = useCartStore(selectCartItemCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const tax = useCartStore(selectCartTax);
  const shipping = useCartStore(selectCartShipping);
  const total = useCartStore(selectCartTotal);
  const hasHydrated = useCartStore(selectHasHydrated);

  if (!hasHydrated) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-52 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Separator />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/20 text-center p-6">
        <CardContent className="flex flex-col items-center justify-center p-0 space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-6 w-6 opacity-40" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-foreground">Your cart is empty</h4>
            <p className="text-xs text-muted-foreground">
              Add products to your cart before proceeding with checkout.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Return to Catalog
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Order Summary
          </CardTitle>
          <span className="text-xs font-semibold text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>
        <CardDescription className="text-xs">
          Verify your hardware selection
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Item List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center justify-between text-sm py-1.5"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0 border p-1 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate text-xs sm:text-sm">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Qty: {quantity} × {formatPrice(product.price)}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-foreground text-xs sm:text-sm tabular-nums shrink-0">
                {formatPrice(product.price * quantity)}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Cost Breakdown */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-medium text-foreground tabular-nums">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span>Estimated Sales Tax (8%)</span>
            <span className="font-medium text-foreground tabular-nums">
              {formatPrice(tax)}
            </span>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span>Standard Shipping</span>
            <span className="font-medium text-foreground tabular-nums">
              {shipping === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  FREE
                </span>
              ) : (
                formatPrice(shipping)
              )}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between text-base font-extrabold text-foreground pt-1">
            <span>Total</span>
            <span className="text-primary tabular-nums tracking-tight">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="pt-2 border-t grid grid-cols-3 gap-2 text-[11px] text-muted-foreground text-center">
          <div className="flex flex-col items-center gap-1 p-2 rounded bg-muted/40">
            <Truck className="h-3.5 w-3.5 text-primary" />
            <span>Fast Dispatch</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded bg-muted/40">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>2-Yr Warranty</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded bg-muted/40">
            <RotateCcw className="h-3.5 w-3.5 text-primary" />
            <span>30-Day Returns</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
