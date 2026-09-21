"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  useCartStore,
  selectCartItems,
  selectCartItemCount,
  selectCartSubtotal,
  selectCartShipping,
  selectCartTotal,
  selectHasHydrated,
} from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export function CartButton() {
  const [open, setOpen] = React.useState(false);

  // Selective subscriptions avoiding whole store re-renders
  const itemCount = useCartStore(selectCartItemCount);
  const items = useCartStore(selectCartItems);
  const subtotal = useCartStore(selectCartSubtotal);
  const shipping = useCartStore(selectCartShipping);
  const total = useCartStore(selectCartTotal);
  const hasHydrated = useCartStore(selectHasHydrated);

  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  // Dimensionally stable SSR/initial render placeholder preventing CLS and hydration mismatch
  if (!hasHydrated) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="relative w-9 h-9"
        aria-label="Shopping Cart (Loading)"
        disabled
      >
        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  const handleRemove = (productId: string, productName: string) => {
    removeItem(productId);
    toast.info(`Removed "${productName}" from cart.`);
  };

  const handleClear = () => {
    clearCart();
    toast.info("Shopping cart cleared.");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative w-9 h-9 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Shopping cart with ${itemCount} items. Subtotal ${formatPrice(subtotal)}`}
        >
          <ShoppingBag className="h-4 w-4" />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground shadow-sm animate-in zoom-in-50">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-md p-6 h-full"
      >
        <SheetHeader className="space-y-1 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Your Cart
            </SheetTitle>
            {items.length > 0 && (
              <Badge variant="secondary" className="font-medium text-xs">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Badge>
            )}
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Review and adjust your selected items before proceeding to checkout.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-8 w-8 opacity-40" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground text-lg">
                Your cart is empty
              </h4>
              <p className="text-sm text-muted-foreground max-w-[220px]">
                Explore our catalog and discover studio-grade minimalist hardware.
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setOpen(false)}
              className="mt-2"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-3">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 rounded-lg border bg-card/60 transition-colors hover:bg-card"
                >
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center shrink-0 border overflow-hidden p-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h5 className="font-medium text-sm text-foreground truncate">
                        {product.name}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(product.price)} each
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md h-7">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(product.id)}
                          aria-label={`Decrease quantity of ${product.name}`}
                          className="px-2 h-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increaseQuantity(product.id)}
                          aria-label={`Increase quantity of ${product.name}`}
                          className="px-2 h-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground tabular-nums">
                          {formatPrice(product.price * quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemove(product.id, product.name)}
                          aria-label={`Remove ${product.name} from cart`}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary & Actions */}
            <div className="space-y-3 pt-3 border-t">
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {shipping === 0 ? "FREE (Orders $100+)" : formatPrice(shipping)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-bold text-foreground pt-1">
                  <span>Total</span>
                  <span className="text-primary tabular-nums">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  asChild
                  className="w-full h-10 font-semibold"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/checkout" className="flex items-center justify-center gap-2">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors underline-offset-4 hover:underline"
                  >
                    Clear cart
                  </button>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    Instant state updates
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
