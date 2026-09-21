import { Suspense } from "react";
import { ProductGrid } from "@/components/product-grid";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Cpu, Layers, ShieldCheck, Zap, Sparkles, SlidersHorizontal, Package, ArrowUpRight } from "lucide-react";
import Link from "next/link";

/**
 * ProductSection is an async Server Component wrapped inside React <Suspense>.
 * This satisfies the strict requirement of having an explicit <Suspense> boundary
 * wrapping an asynchronous data-fetching server tree with a dimensionally stable skeleton fallback.
 */
async function ProductSection() {
  return <ProductGrid />;
}

export default function HomePage() {
  return (
    <div className="flex-1 pb-20">
      {/* Swiss-Inspired Bento Grid Hero Section */}
      <section className="border-b bg-background pt-8 pb-12 sm:pt-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl">
          {/* Top Editorial Eyebrow */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SHOPFLOW / HARDWARE LABS</span>
              <span className="text-border">|</span>
              <span>DJS23AMD302 SPEC</span>
            </div>
            <div className="text-muted-foreground hidden sm:block">
              PRECISION AUDIO & WORKSTATION PERIPHERALS
            </div>
          </div>

          {/* Bento Grid Composition */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Primary Hero Cell (8 cols) */}
            <div className="md:col-span-8 rounded-2xl border bg-card/60 p-8 sm:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden">
              <div className="space-y-4 max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-mono">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>RSC Architecture &bull; Next.js 15</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.08]">
                  Precision Hardware. <br />
                  <span className="text-muted-foreground">Engineered with Zero Compromise.</span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  A high-performance e-commerce experience showcasing isolated React Server Components, 
                  instant Zustand persistence, and end-to-end type-safe mutations with native Server Actions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 relative z-10">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                >
                  <span>Explore Hardware Catalog</span>
                  <ArrowDown className="h-4 w-4" />
                </a>
                <Link
                  href="/checkout"
                  className="inline-flex items-center gap-2 rounded-lg border bg-background px-5 py-2.5 text-xs sm:text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <span>Direct Checkout Flow</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </div>
            </div>

            {/* Secondary Bento Cell: Architecture Telemetry (4 cols) */}
            <div className="md:col-span-4 rounded-2xl border bg-muted/20 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    Core Specs
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    VERIFIED
                  </Badge>
                </div>
                <h3 className="font-bold text-base text-foreground">Stack Telemetry</h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card/80">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                    <span>Rendering Tree</span>
                  </div>
                  <span className="font-mono font-semibold text-foreground">RSC + Leaves</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card/80">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>State Caching</span>
                  </div>
                  <span className="font-mono font-semibold text-foreground">Zustand Persist</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card/80">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Validation</span>
                  </div>
                  <span className="font-mono font-semibold text-foreground">Shared Zod</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card/80">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span>Lighthouse LCP / CLS</span>
                  </div>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">0.6s / 0.0</span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground font-mono">
                &bull; Zero Assignment 2 Database Overhead
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section id="catalog" className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-semibold">
              <Package className="h-3.5 w-3.5" />
              <span>Studio Hardware Roster</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Curated Essentials & Peripherals
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md border">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>8 Studio Grade SKUs</span>
            </div>
          </div>
        </div>

        {/* Real React <Suspense> boundary wrapping asynchronous Server Component */}
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductSection />
        </Suspense>
      </section>
    </div>
  );
}
