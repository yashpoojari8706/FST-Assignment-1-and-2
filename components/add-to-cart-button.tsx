"use client";

import * as React from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/products";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: Product; // Fully serializable data crossing the Server -> Client boundary
}

/**
 * AddToCartButton is an isolated Client Component.
 * Receives a strictly serializable product object as props from the Server-rendered ProductCard.
 */
export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = React.useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, 1);
    setAdded(true);

    // Accessible notification dispatch via Sonner toast
    toast.success(`Added "${product.name}" to cart!`, {
      description: `$${product.price.toFixed(2)} — In stock`,
      duration: 3000,
    });

    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  return (
    <Button
      onClick={handleAddToCart}
      size="sm"
      className="w-full gap-2 transition-all active:scale-[0.98]"
      variant={added ? "secondary" : "default"}
      aria-label={`Add ${product.name} to shopping cart for $${product.price.toFixed(2)}`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4 text-emerald-600 animate-in zoom-in-50" />
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            Added!
          </span>
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" />
          <span>Add to Cart</span>
        </>
      )}
    </Button>
  );
}
