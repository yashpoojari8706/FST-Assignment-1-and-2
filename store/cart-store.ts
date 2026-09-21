"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@/lib/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStoreState {
  items: CartItem[];
  // Transient state for hydration tracking (never persisted to localStorage)
  hasHydrated: boolean;
  setHasHydrated: (status: boolean) => void;

  // Mutation actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (status: boolean) => set({ hasHydrated: status }),

      addItem: (product: Product, quantity = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (item) => item.product.id === product.id
        );

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + quantity,
          };
          set({ items: updatedItems });
        } else {
          set({ items: [...currentItems, { product, quantity }] });
        }
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },

      increaseQuantity: (productId: string) => {
        set({
          items: get().items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        });
      },

      decreaseQuantity: (productId: string) => {
        const currentItems = get().items;
        const targetItem = currentItems.find((item) => item.product.id === productId);

        if (targetItem && targetItem.quantity > 1) {
          set({
            items: currentItems.map((item) =>
              item.product.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ),
          });
        } else {
          // If quantity reaches 0, remove item from cart
          set({
            items: currentItems.filter((item) => item.product.id !== productId),
          });
        }
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: "shopflow-cart-storage",
      storage: createJSONStorage(() => localStorage),
      // Crucial requirement: only persist items, keep hasHydrated transient in memory
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// High-performance selective selectors to prevent unnecessary re-renders across components
export const selectCartItems = (state: CartStoreState) => state.items;
export const selectCartItemCount = (state: CartStoreState) =>
  state.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartSubtotal = (state: CartStoreState) =>
  state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
export const selectCartTax = (state: CartStoreState) => {
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  return subtotal * 0.08; // 8% estimated tax
};
export const selectCartTotal = (state: CartStoreState) => {
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 12) : 0;
  return subtotal + tax + shipping;
};
export const selectCartShipping = (state: CartStoreState) => {
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  return subtotal > 0 ? (subtotal >= 100 ? 0 : 12) : 0;
};
export const selectHasHydrated = (state: CartStoreState) => state.hasHydrated;
