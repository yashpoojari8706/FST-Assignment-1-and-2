import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/products";

/**
 * ProductGrid is an asynchronous Server Component.
 * Fetches data on the server and renders static ProductCard components.
 */
export async function ProductGrid() {
  const products = await getProducts();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
