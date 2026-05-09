import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, Tag, ArrowRight, Percent, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../store/shop";
import { EmptyState } from "../components/EmptyState";
import { fileUrl } from "../api/axios";
import API from "../api/axios";

/* ─── Cart Item ─────────────────────────────────────────────────── */
function CartItem({ item, onRemove, onQty }) {
  const fullPrice = item.price * item.qty;
  const discounted = Math.round(fullPrice * 0.95);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22 }}
      className="flex gap-4 p-4 sm:p-5"
      data-testid={`cart-item-${item.product_id}`}
    >
      {/* Image */}
      <Link
        to={`/product/${item.product_id}`}
        className="flex-shrink-0 h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-gray-100 dark:bg-neutral-800 hover:opacity-90 transition-opacity"
      >
        {item.image
          ? <img src={fileUrl(item.image)} alt={item.name} className="h-full w-full object-contain p-2" />
          : <div className="h-full w-full flex items-center justify-center text-gray-300"><ShoppingBag size={24} /></div>
        }
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {item.brand && (
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                {item.brand}
              </p>
            )}
            <Link
              to={`/product/${item.product_id}`}
              className="mt-0.5 font-semibold text-sm sm:text-base leading-snug hover:text-gray-500 dark:hover:text-gray-300 transition-colors line-clamp-2"
            >
              {item.name}
            </Link>
            {item.color && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                {item.color}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            data-testid={`cart-remove-${item.product_id}`}
            className="flex-shrink-0 h-7 w-7 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Bottom: qty + price */}
        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          {/* Stepper */}
          <div className="inline-flex items-center h-9 rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 overflow-hidden">
            <button
              type="button"
              onClick={() => onQty(item.qty - 1)}
              disabled={item.qty <= 1}
              className="h-full w-9 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-25"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-sm font-bold tabular-nums">{item.qty}</span>
            <button
              type="button"
              onClick={() => onQty(item.qty + 1)}
              disabled={item.qty >= (item.available || 9999)}
              className="h-full w-9 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-25"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Price block */}
          <div className="text-right">
            <div className="text-base sm:text-lg font-bold">
              {discounted.toLocaleString("ru-RU")} ₸
            </div>
            <div className="text-xs text-gray-400 line-through">
              {fullPrice.toLocaleString("ru-RU")} ₸
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────── */
export default function Cart() {
  const { items, setQty, remove, total, removeOutOfStock } = useCart();
  const navigate = useNavigate();
  const [removedItems, setRemovedItems] = useState([]);

  // On mount: validate stock for all cart items
  useEffect(() => {
    if (items.length === 0) return;
    let alive = true;

    const validate = async () => {
      const soldOut = [];
      const soldOutKeys = [];

      for (const item of items) {
        try {
          const { data } = await API.get(`/products/${item.product_id}`);
          const color = data.colors?.find((c) => c.name === item.color) || data.colors?.[0];
          const available = Math.max((color?.stock || 0) - (color?.reserved || 0), 0);

          if (available === 0) {
            soldOut.push(item.name);
            soldOutKeys.push(`${item.product_id}_${item.color || ""}`);
          }
        } catch {
          // Product deleted entirely — also remove
          soldOut.push(item.name);
          soldOutKeys.push(`${item.product_id}_${item.color || ""}`);
        }
      }

      if (!alive) return;
      if (soldOutKeys.length > 0) {
        setRemovedItems(soldOut);
        removeOutOfStock(soldOutKeys);
      }
    };

    validate();
    return () => { alive = false; };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Корзина</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Корзина пуста"
          description="Самое время найти что-то интересное в каталоге."
          action={
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold hover:opacity-90 transition-opacity"
              data-testid="cart-to-catalog-btn"
            >
              Перейти в каталог <ArrowRight size={15} />
            </Link>
          }
        />
      </div>
    );
  }

  const rawTotal = total();
  const discountAmount = Math.round(rawTotal * 0.05);
  const finalTotal = rawTotal - discountAmount;
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Корзина
        <span className="ml-3 text-base font-normal text-gray-400">
          {totalQty} {totalQty === 1 ? "товар" : totalQty < 5 ? "товара" : "товаров"}
        </span>
      </h1>

      {/* Sold-out notification */}
      <AnimatePresence>
        {removedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3.5 flex items-start gap-3"
          >
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <span className="font-semibold">Некоторые товары закончились и были удалены из корзины:</span>
              <ul className="mt-1 list-disc list-inside text-amber-700 dark:text-amber-400">
                {removedItems.map((name, i) => <li key={i}>{name}</li>)}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">

        {/* ── Items list ── */}
        <div className="rounded-3xl border-2 border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden divide-y divide-gray-100 dark:divide-neutral-800">
          <AnimatePresence initial={false}>
            {items.map((it) => (
              <CartItem
                key={`${it.product_id}-${it.color}`}
                item={it}
                onRemove={() => remove(it.product_id, it.color)}
                onQty={(qty) => setQty(it.product_id, it.color, qty)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* ── Summary ── */}
        <aside className="lg:sticky lg:top-6 rounded-3xl border-2 border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">

          {/* 5% discount banner */}
          <div className="bg-emerald-500 px-5 py-3.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Percent size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Скидка 5% за онлайн-заказ</p>
              <p className="text-emerald-100 text-xs mt-0.5">Применяется автоматически при оформлении</p>
            </div>
          </div>

          <div className="p-5 space-y-4">

            {/* Price breakdown */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Сумма товаров</span>
                <span data-testid="cart-total-old">{rawTotal.toLocaleString("ru-RU")} ₸</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Tag size={13} />
                  Скидка 5%
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  −{discountAmount.toLocaleString("ru-RU")} ₸
                </span>
              </div>
              <div className="border-t border-gray-100 dark:border-neutral-800 pt-3 flex items-end justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Итого к оплате</span>
                <span
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
                  data-testid="cart-total"
                >
                  {finalTotal.toLocaleString("ru-RU")} <span className="text-lg font-bold text-gray-400">₸</span>
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => navigate("/checkout")}
              data-testid="cart-checkout-btn"
              className="w-full h-12 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-gray-900/10"
            >
              Оформить заказ
              <ArrowRight size={16} />
            </button>

            <Link
              to="/catalog"
              className="block text-center text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              data-testid="cart-continue-shopping"
            >
              ← Продолжить покупки
            </Link>

            {/* Payment icons */}
            <div className="pt-1 flex items-center justify-center gap-3 text-[11px] text-gray-400 font-medium">
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800">Kaspi Red</span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800">Рассрочка</span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800">Наличные</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
