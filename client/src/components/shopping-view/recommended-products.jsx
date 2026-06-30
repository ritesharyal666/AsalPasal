import { Sparkles } from "lucide-react";
import ShoppingProductTile from "./product-tile";

/**
 * Reusable row of ML-recommended products.
 * `products` come from the recommender API (same shape as the catalogue),
 * so we can reuse the existing ShoppingProductTile.
 */
function RecommendedProducts({
  title = "Recommended for you",
  subtitle,
  products = [],
  isLoading = false,
  handleAddtoCart,
}) {
  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-slate-400 text-sm">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-full max-w-sm h-72 rounded-lg bg-slate-800/50 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ShoppingProductTile
                key={product._id}
                product={product}
                handleAddtoCart={handleAddtoCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default RecommendedProducts;
