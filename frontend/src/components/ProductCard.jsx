import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import { useFavorites } from "../store/shop";
import { fileUrl } from "../api/axios";
import { useCart } from "../store/shop";
import { useAuth } from "../store/auth";

export const ProductCard = ({ product, index = 0 }) => {
  const { has, toggle } = useFavorites();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ Считаем сток по всем цветам
  const totalAvailable = product.colors?.length
    ? product.colors.reduce(
        (sum, c) => sum + Math.max((c.stock || 0) - (c.reserved || 0), 0),
        0
      )
    : Math.max((product.stock || 0) - (product.reserved || 0), 0);

  const inStock = totalAvailable > 0;
  const img = product.colors?.[0]?.images?.[0] || product.images?.[0] || "";
  const fav = has(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      sessionStorage.setItem("redirectAfterLogin", "/cart");
      navigate("/login");
      return;
    }
    navigate(`/product/${product._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      className="h-full"
    >
      <div className="group bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden transition hover:shadow-xl flex flex-col h-full">
        <Link
          className="block flex-1"
          to={`/product/${product._id}`}
          data-testid={`product-card-${product._id}`}
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-neutral-800">
            {img ? (
              <img
                src={fileUrl(img)}
                alt={product.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                style={{ objectPosition: "center 70%" }}
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                Нет фото
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(product._id);
              }}
              className={`absolute top-2.5 right-2.5 h-8 w-8 rounded-full flex items-center justify-center border backdrop-blur-sm transition ${
                fav
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white/80 dark:bg-black/50 border-gray-200 dark:border-neutral-700 hover:border-primary"
              }`}
            >
              <Heart size={13} fill={fav ? "currentColor" : "none"} />
            </button>

            <span
              className={`absolute bottom-2.5 left-2.5 text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-medium ${
                inStock
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {inStock ? "В наличии" : "Нет"}
            </span>
          </div>

          {/* ✅ Text info — фиксированная высота для бренда убирает пустое место */}
          <div className="p-2.5 sm:p-3 flex flex-col gap-1">
            <div className="text-[12px] sm:text-sm font-medium line-clamp-2 leading-snug min-h-[32px] sm:min-h-[40px]">
              {product.name}
            </div>
            <div className="text-sm sm:text-base font-semibold">
              {product.price?.toLocaleString("ru-RU")} ₸
            </div>
            {/* ✅ Всегда занимает место — пустая строка если нет бренда */}
            <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 h-[14px]">
              {product.brand || ""}
            </div>
          </div>
        </Link>

        <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3">
          <button
            onClick={handleAddToCart}
            className="w-full h-9 sm:h-10 rounded-xl bg-foreground text-background hover:opacity-80 transition text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-1.5"
          >
            <ShoppingCart size={13} />
            В корзину
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const ProductCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 flex flex-col">
    <div className="aspect-square skeleton" />
    <div className="p-2.5 sm:p-3 space-y-2 flex-1">
      <div className="h-3 w-full skeleton rounded" />
      <div className="h-3 w-3/4 skeleton rounded" />
      <div className="h-5 w-24 skeleton rounded mt-1" />
      <div className="h-[14px] w-16 skeleton rounded" />
    </div>
    <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3">
      <div className="h-9 sm:h-10 w-full skeleton rounded-xl" />
    </div>
  </div>
);
