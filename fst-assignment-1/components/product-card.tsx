import { Product } from "@/lib/products";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard is a pure React Server Component (RSC).
 * It renders all static structure, images, typography, and badges on the server.
 * Only the interactive leaf `AddToCartButton` is loaded as a Client Component,
 * taking the plain serializable `product` prop across the hydration boundary.
 */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden border-border/70 hover:border-primary/40 hover:shadow-lg transition-all duration-200 group">
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full bg-gradient-to-b from-muted/40 to-muted/80 flex items-center justify-center p-6 overflow-hidden">
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant={
                product.badge === "Bestseller"
                  ? "default"
                  : product.badge === "New"
                  ? "success"
                  : "secondary"
              }
              className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 shadow-sm"
            >
              {product.badge}
            </Badge>
          </div>
        )}

        <img
          src={product.image}
          alt={`Visual representation of ${product.name}`}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          width={280}
          height={280}
        />
      </div>

      {/* Product Info */}
      <CardHeader className="p-4 pb-2 space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-wider text-[10px]">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-medium">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span className="text-foreground text-xs">{product.rating}</span>
            <span className="text-muted-foreground text-[11px]">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-base text-foreground leading-snug tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-2 border-t bg-muted/20 flex flex-col gap-3">
        <div className="flex items-baseline justify-between w-full">
          <span className="text-xs text-muted-foreground font-medium">Price</span>
          <span className="text-lg font-extrabold text-foreground tabular-nums tracking-tight">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Client Component Leaf with Serializable Props */}
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  );
}
