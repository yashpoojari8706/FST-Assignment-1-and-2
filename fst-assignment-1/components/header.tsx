import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartButton } from "@/components/cart-button";
import { Cpu, ShieldCheck } from "lucide-react";

/**
 * Header is a React Server Component.
 * Notice how Header itself is NOT marked with 'use client', demonstrating
 * fine-grained client boundary isolation: only ThemeToggle and CartButton
 * are interactive Client leaves.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
            aria-label="ShopFlow Home"
          >
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-none text-base font-extrabold tracking-tight">
                ShopFlow
              </span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
                Studio Gear
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link
              href="/"
              className="text-foreground transition-colors hover:text-primary font-medium"
            >
              Catalog
            </Link>
            <Link
              href="/checkout"
              className="transition-colors hover:text-foreground"
            >
              Checkout
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Assignment 1 Demo</span>
            </div>
          </nav>
        </div>

        {/* Client Interactive Boundary Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
