import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import API from "../api/axios"; import { useFavorites } from "../store/shop";
import { ProductCard, ProductCardSkeleton } from "../components/ProductCard";
import { EmptyState } from "../components/EmptyState";
import { SEO } from "../components/SEO";

export default function Favorites() {
  const { ids } = useFavorites();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get("/products");

        console.log("IDS:", ids);
        console.log("PRODUCTS:", data);

        setProducts(
          data.filter((p) => ids.includes(String(p._id)))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [ids]);

  return (
    <>
      <SEO title="Избранное" path="/favorites" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Избранное
        </h1>

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="В избранном пусто"
              description="Добавляйте товары, которые понравились — они будут ждать вас тут."
              action={
                <Link
                  to="/catalog"
                  data-testid="favorites-to-catalog-btn"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Перейти в каталог
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
