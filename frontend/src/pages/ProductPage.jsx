import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  ShoppingBag,
  Check,
  ArrowLeft,
  Heart,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
} from "lucide-react";
import { toast } from "sonner";

import API, { fileUrl } from "../api/axios";
import { useCart, useFavorites } from "../store/shop";
import { useAuth } from "../store/auth";

/* ─── Skeleton ─────────────────────────────────────────────────── */
function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800 ${className}`}
    />
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="h-4 w-16 mb-8 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-3">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-xl flex-shrink-0" />
              ))}
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-6 w-1/3 rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
            <Skeleton className="h-12 w-full rounded-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Gallery ───────────────────────────────────────────────────── */
function Gallery({ images, productName, onZoomChange }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStart = useRef(null);

  useEffect(() => setActive(0), [images]);

  useEffect(() => {
    if (zoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [zoomed]);

  const validImages = images.filter(Boolean);

  const prev = () => setActive((i) => (i > 0 ? i - 1 : validImages.length - 1));
  const next = () => setActive((i) => (i < validImages.length - 1 ? i + 1 : 0));

  const openZoom = () => {
    setZoomed(true);
    onZoomChange?.(true);
  };

  const closeZoom = () => {
    setZoomed(false);
    onZoomChange?.(false);
  };

  const onTouchStart = (e) => (touchStart.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) dx > 0 ? next() : prev();
    touchStart.current = null;
  };

  if (!validImages.length)
    return (
      <div className="aspect-square rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-400 text-sm">
        Нет фото
      </div>
    );

  const activeSrc = fileUrl(validImages[active]) || null;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main */}
      <div
        className="relative aspect-square w-full max-h-[520px] rounded-3xl overflow-hidden bg-gray-50 dark:bg-neutral-900 group cursor-zoom-in select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={openZoom}
      >
        {activeSrc && (
          <img
            src={activeSrc}
            alt={productName}
            className="h-full w-full object-contain"
            draggable={false}
          />
        )}

        {/* Zoom hint */}
        <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
          <ZoomIn size={13} className="text-gray-600 dark:text-gray-300" />
        </div>

        {/* Nav arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/85 dark:bg-black/60 backdrop-blur shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/85 dark:bg-black/60 backdrop-blur shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Dots */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {validImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActive(i); }}
                className={`rounded-full transition-all ${i === active
                  ? "w-5 h-1.5 bg-gray-800 dark:bg-white"
                  : "w-1.5 h-1.5 bg-gray-400/60"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbs */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((img, i) => {
            const thumbSrc = fileUrl(img) || null;
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${i === active
                  ? "border-gray-800 dark:border-white scale-105 shadow-md"
                  : "border-transparent opacity-55 hover:opacity-90 hover:border-gray-300 dark:hover:border-neutral-600"
                  }`}
              >
                {thumbSrc && <img src={thumbSrc} alt="" className="h-full w-full object-cover" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen zoom */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            className="fixed inset-0 z-[99999] isolate bg-black flex items-center justify-center"
            style={{ touchAction: "none" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // FIX: onZoomChange вызывается при клике на фон
            onClick={closeZoom}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 h-11 w-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                closeZoom();
              }}
            >
              <X size={20} />
            </button>

            {/* Left arrow */}
            {validImages.length > 1 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Right arrow */}
            {validImages.length > 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight size={22} />
              </button>
            )}

            <motion.div
              className="relative max-h-[90vh] max-w-[90vw] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.88 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.22 }}
            >
              {activeSrc && (
                <img
                  src={activeSrc}
                  alt={productName}
                  className="max-h-[85vh] max-w-[85vw] object-contain rounded-2xl"
                />
              )}
            </motion.div>

            {/* Dots in zoom */}
            {validImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {validImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActive(i); }}
                    className={`rounded-full transition-all ${i === active ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Color Button ──────────────────────────────────────────────── */
function ColorBtn({ color, active, onClick, ...props }) {
  return (
    <button
      {...props}
      type="button"
      onClick={onClick}
      className={`relative h-10 pl-2 pr-4 rounded-full border-2 text-sm font-medium flex items-center gap-2 transition-all duration-200 ${active
        ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md"
        : "border-gray-200 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500 bg-white dark:bg-neutral-900"
        }`}
    >
      <span
        className="h-6 w-6 rounded-full border border-black/10 dark:border-white/10 flex-shrink-0"
        style={{ background: color.hex || "#ccc" }}
      />
      {color.name}
      {active && <Check size={11} className="ml-0.5" />}
    </button>
  );
}

/* ─── Qty Stepper ───────────────────────────────────────────────── */
function QtyStepper({ qty, setQty, max }) {
  return (
    <div className="inline-flex items-center h-12 rounded-2xl border-2 border-gray-200 dark:border-neutral-700 overflow-hidden bg-gray-50 dark:bg-neutral-900">
      <button
        type="button"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        disabled={qty <= 1}
        className="h-full w-12 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-25"
      >
        <Minus size={14} />
      </button>
      <span className="w-10 text-center text-sm font-bold tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => setQty((q) => Math.min(max, q + 1))}
        disabled={qty >= max}
        className="h-full w-12 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-25"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [colorIdx, setColorIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);
  const add = useCart((s) => s.add);
  const { has, toggle } = useFavorites();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    API.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => setQty(1), [colorIdx]);

  const images = useMemo(() => {
    if (!product) return [];
    const color = product.colors?.[colorIdx];
    if (color?.images?.length) return color.images;
    return product.images || [];
  }, [product, colorIdx]);

  if (loading) return <LoadingState />;

  if (!product)
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-semibold mb-4">Товар не найден</p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Вернуться в каталог
        </Link>
      </div>
    );

  const currentColor = product.colors?.[colorIdx];
  const available = Math.max((currentColor?.stock || 0) - (currentColor?.reserved || 0), 0);
  const inStock = available > 0;
  const selectedColor = currentColor?.name || "default";
  const fav = has(product._id);

  const onAdd = () => {
    if (!inStock) return;

    // Если не авторизован — запомнить товар и уйти на логин
    if (!user) {
      // Сохраняем pending-товар чтобы добавить после входа
      sessionStorage.setItem("pendingCartItem", JSON.stringify({
        product_id: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        qty: Math.min(Math.max(qty, 1), available),
        color: currentColor?.name || null,
        image: images[0] || null,
        available,
        returnTo: window.location.pathname,
      }));
      navigate("/login");
      return;
    }

    const clamped = Math.min(Math.max(qty, 1), available);
    add(
      {
        product_id: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        qty: clamped,
        color: currentColor?.name || null,
        image: images[0] || null,
      },
      available
    );
    toast.success("Добавлено в корзину", {
      action: { label: "В корзину", onClick: () => navigate("/cart") },
    });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-7 group"
          data-testid="product-back-btn"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Назад
        </button>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 xl:gap-20 items-start">

          {/* Gallery */}
          <div className="min-w-0 w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full"
            >
              <Gallery
                images={images}
                productName={product.name}
                onZoomChange={setZoomOpen}
              />
            </motion.div>
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.07 }}
            className="flex flex-col gap-5 min-w-0 w-full"
          >
            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {product.brand && (
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500 mb-1">
                    {product.brand}
                  </p>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                  {product.name}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => product?._id && toggle(product._id)}
                data-testid="product-fav-btn"
                className={`flex-shrink-0 h-10 w-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 ${fav
                  ? "bg-red-50 border-red-300 text-red-500 dark:bg-red-950 dark:border-red-800"
                  : "border-gray-200 dark:border-neutral-700 text-gray-400 hover:border-red-200 hover:text-red-400"
                  }`}
              >
                <Heart size={16} fill={fav ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                data-testid="product-price"
              >
                {product.price?.toLocaleString("ru-RU")}{" "}
                <span className="text-xl font-bold text-gray-400">₸</span>
              </span>
              <span
                data-testid="product-stock-badge"
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${inStock
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-gray-500"
                  }`}
              >
                {inStock ? `В наличии · ${available} шт` : "Нет в наличии"}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="border-t border-gray-100 dark:border-neutral-800" />

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div data-testid="product-colors" className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2.5">
                  Цвет:{" "}
                  <span className="text-gray-900 dark:text-white">{currentColor?.name}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c, i) => (
                    <ColorBtn
                      key={c.name + i}
                      color={c}
                      active={i === colorIdx}
                      onClick={() => setColorIdx(i)}
                      data-testid={`color-option-${i}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="flex items-center gap-3 pt-1">
              <QtyStepper qty={qty} setQty={setQty} max={available} />
              <button
                type="button"
                onClick={onAdd}
                disabled={!inStock}
                data-testid="product-add-to-cart-btn"
                className={`flex-1 h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${inStock
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 active:scale-[0.98] shadow-lg shadow-gray-900/10"
                  : "bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <ShoppingBag size={16} />
                {inStock ? "Добавить в корзину" : "Нет в наличии"}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-blue-500"
                    >
                      <path d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      <rect x="9" y="12" width="6" height="7" rx="1" />
                    </svg>
                  ),
                  label: "Доставка",
                  sub: "по Астане",
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-emerald-500"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  ),
                  label: "Оригинал",
                  sub: "с гарантией",
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-purple-500"
                    >
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  ),
                  label: "Kaspi Red",
                  sub: "рассрочка",
                },
              ].map((b) => (
                <div
                  key={b.label}
                  className="rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 py-3 px-2 text-center"
                >
                  <div className="flex justify-center mb-1">{b.icon}</div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {b.label}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{b.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}