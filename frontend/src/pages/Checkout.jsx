import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, ChevronDown, MapPin, Truck, Check } from "lucide-react";
import { toast } from "sonner";

import API from "../api/axios";
import { useCart } from "../store/shop";
import { useAuth } from "../store/auth";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  const [form, setForm] = useState({
    customer_name: user?.name || "",
    email: user?.email || "",
    phone: "",
    city: "",
    district: "",
    street: "",
    comment: "",
  });

  // Keep name/email in sync if user logs in after mount
  useEffect(() => {
    setForm((f) => ({
      ...f,
      customer_name: f.customer_name || user?.name || "",
      email: f.email || user?.email || "",
    }));
  }, [user]);

  // Load cities
  useEffect(() => {
    API.get("/cities")
      .then((r) => setCities(r.data))
      .catch(() => { })
      .finally(() => setCitiesLoading(false));
  }, []);

  const selectedCity = cities.find((c) => c._id === form.city);
  const isFree = selectedCity?.isFreeDelivery ?? null;
  const districts = selectedCity?.districts || [];

  const setField = (k) => (e) =>
    setForm((f) => {
      const updated = { ...f, [k]: e.target.value };
      // reset district when city changes
      if (k === "city") updated.district = "";
      return updated;
    });

  // Build address string for backend
  const buildAddress = () => {
    const parts = [
      selectedCity?.name,
      districts.find((d) => d._id === form.district)?.name,
      form.street,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error("Корзина пуста"); return; }
    if (!form.city) { toast.error("Выберите город"); return; }
    if (districts.length > 0 && !form.district) { toast.error("Выберите район"); return; }
    if (!form.street.trim()) { toast.error("Укажите улицу и дом"); return; }

    setLoading(true);
    try {
      const payload = {
        customer_name: form.customer_name,
        email: form.email,
        phone: form.phone,
        address: buildAddress(),
        city: selectedCity?.name,
        district: districts.find((d) => d._id === form.district)?.name || "",
        is_free_delivery: !!isFree,
        comment: form.comment,
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          brand: i.brand,
          price: i.price,
          qty: i.qty,
          color: i.color,
          image: i.image,
        })),
      };
      const { data } = await API.post("/orders", payload);
      setSuccess(data);
      clear();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Не удалось оформить заказ");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 18 }}
          className="inline-flex h-20 w-20 rounded-full bg-primary/10 text-primary items-center justify-center mb-6"
        >
          <CheckCircle2 size={40} />
        </motion.div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Спасибо, {success.customer_name}!
        </h1>
        <p className="mt-4 text-muted-foreground">
          Заказ оформлен{" "}
          <span className="font-medium text-foreground">
            {new Date(success.createdAt).toLocaleString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <br />
          Скоро с вами свяжется администратор.
        </p>

        {success.discount_amount > 0 && (
          <div className="mt-8 inline-block rounded-2xl border border-border bg-card px-6 py-5 text-left min-w-[280px]">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Сумма заказа
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-sm text-muted-foreground line-through">
                {success.subtotal.toLocaleString("ru-RU")} ₸
              </span>
              <span className="font-display text-2xl font-semibold text-primary">
                {success.total.toLocaleString("ru-RU")} ₸
              </span>
            </div>
            <div className="mt-2 text-xs text-primary font-medium">
              Вы сэкономили {success.discount_amount.toLocaleString("ru-RU")} ₸ (5% онлайн-скидка)
            </div>
          </div>
        )}

        <div className="mt-10 flex gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="h-11 px-6 rounded-full bg-foreground text-background font-medium"
            data-testid="order-success-home-btn"
          >
            На главную
          </button>
          <button
            onClick={() => navigate("/catalog")}
            className="h-11 px-6 rounded-full border border-border"
          >
            В каталог
          </button>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
        Оформление заказа
      </h1>

      <form
        onSubmit={submit}
        className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
        data-testid="checkout-form"
      >
        {/* ── Left: form fields ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8">

          {/* Personal */}
          <SectionTitle>Контактные данные</SectionTitle>
          <Field
            label="Имя *"
            required
            value={form.customer_name}
            onChange={setField("customer_name")}
            testId="checkout-name"
          />
          <Field
            label="Email *"
            required
            type="email"
            value={form.email}
            onChange={setField("email")}
            testId="checkout-email"
          />
          <Field
            label="Телефон"
            value={form.phone}
            onChange={setField("phone")}
            placeholder="+7 (___) ___-__-__"
            testId="checkout-phone"
          />

          {/* Divider */}
          <div className="border-t border-border pt-1" />

          {/* Delivery address */}
          <SectionTitle icon={MapPin}>Адрес доставки</SectionTitle>

          {/* City select */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Город *
            </label>
            {citiesLoading ? (
              <div className="h-11 rounded-xl border border-border bg-input animate-pulse" />
            ) : cities.length === 0 ? (
              <div className="h-11 rounded-xl border border-dashed border-border flex items-center px-4 text-sm text-muted-foreground">
                Города не добавлены (настройте в админ-панели)
              </div>
            ) : (
              <CustomSelect
                value={form.city}
                onChange={(val) => setForm((f) => ({ ...f, city: val, district: "" }))}
                placeholder="— Выберите город —"
                required
                testId="checkout-city"
                options={cities.map((c) => ({
                  value: c._id,
                  label: `${c.name}${c.isFreeDelivery ? " (бесплатная доставка)" : " (доставка договорная)"}`,
                }))}
              />
            )}
          </div>

          {/* Delivery badge — animated */}
          <AnimatePresence>
            {form.city && (
              <motion.div
                key="delivery-badge"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div
                  className={`rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium ${isFree
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                >
                  <Truck size={16} className="shrink-0" />
                  {isFree
                    ? "Бесплатная доставка по городу"
                    : "Доставка — договорная. Менеджер уточнит стоимость."}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* District select — shown only if city has districts */}
          <AnimatePresence>
            {form.city && districts.length > 0 && (
              <motion.div
                key="district"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Район *
                </label>
                <CustomSelect
                  value={form.district}
                  onChange={(val) => setForm((f) => ({ ...f, district: val }))}
                  placeholder="— Выберите район —"
                  required={districts.length > 0}
                  testId="checkout-district"
                  options={districts.map((d) => ({ value: d._id, label: d.name }))}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Street / house / apt */}
          <Field
            label="Улица, дом, квартира *"
            required
            value={form.street}
            onChange={setField("street")}
            placeholder="ул. Абая, д. 12, кв. 45"
            testId="checkout-street"
          />

          {/* Comment */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Комментарий
            </label>
            <textarea
              value={form.comment}
              onChange={setField("comment")}
              rows={3}
              placeholder="Пожелания к заказу..."
              data-testid="checkout-comment"
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* ── Right: order summary ──────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 h-max rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Ваш заказ
          </div>

          <div className="space-y-2 max-h-[260px] overflow-auto pr-1 divide-y divide-border scrollbar-thin">
            {items.map((i) => (
              <div
                key={`${i.product_id}-${i.color}`}
                className="py-2 flex justify-between text-sm"
              >
                <div className="min-w-0 pr-2">
                  <div className="truncate font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">
                    × {i.qty}
                    {i.color ? ` · ${i.color}` : ""}
                  </div>
                </div>
                <div className="font-medium whitespace-nowrap">
                  {(i.price * i.qty).toLocaleString("ru-RU")} ₸
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-2.5">
            {/* 5% online discount badge */}
            <div className="rounded-xl bg-primary/10 text-primary px-3 py-2.5 text-xs font-medium flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                5%
              </span>
              Скидка за онлайн-заказ применяется автоматически
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Товары ({items.reduce((s, i) => s + i.qty, 0)})</span>
              <span>{total().toLocaleString("ru-RU")} ₸</span>
            </div>
            <div className="flex justify-between text-sm text-primary font-medium">
              <span>Скидка онлайн 5%</span>
              <span>−{Math.round(total() * 0.05).toLocaleString("ru-RU")} ₸</span>
            </div>

            {/* Delivery row — dynamic */}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Доставка</span>
              <span className={`font-medium ${isFree === null ? "text-muted-foreground" : isFree ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {isFree === null ? "—" : isFree ? "Бесплатно" : "Договорная"}
              </span>
            </div>

            <div className="pt-3 border-t border-border flex items-end justify-between gap-3">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                К оплате
              </span>
              <div className="text-right leading-none">
                <div
                  className="text-sm text-muted-foreground line-through"
                  data-testid="checkout-total-old"
                >
                  {total().toLocaleString("ru-RU")} ₸
                </div>
                <div
                  className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-primary"
                  data-testid="checkout-total-new"
                >
                  {Math.round(total() * 0.95).toLocaleString("ru-RU")} ₸
                </div>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground text-right">
              Экономия: {Math.round(total() * 0.05).toLocaleString("ru-RU")} ₸
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || items.length === 0}
            data-testid="checkout-submit-btn"
            className="w-full h-11 rounded-full bg-foreground text-background font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Подтвердить заказ
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Нажимая, вы соглашаетесь с обработкой персональных данных.
          </p>
        </aside>
      </form>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionTitle = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
    {Icon && <Icon size={14} className="text-primary" />}
    {children}
  </div>
);

const Field = ({ label, required, type = "text", value, onChange, placeholder, testId }) => (
  <div>
    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
      {label}
    </label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid={testId}
      className="w-full h-11 rounded-xl border border-border bg-input px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
    />
  </div>
);

// Custom dropdown — beautiful rounded corners, animated
const CustomSelect = ({ value, onChange, placeholder, options, required, testId }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref} data-testid={testId}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full h-11 rounded-xl border bg-input px-4 pr-10 text-sm text-left flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-ring ${open ? "border-ring ring-2 ring-ring" : "border-border"
          }`}
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground/60"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full rounded-2xl border border-border bg-card shadow-xl overflow-hidden py-1.5"
          >
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full px-4 py-2.5 text-sm text-left flex items-center justify-between gap-2 transition hover:bg-muted ${opt.value === value ? "text-primary font-medium" : "text-foreground"
                    }`}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && <Check size={13} className="shrink-0 text-primary" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Hidden real select for form validation */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="sr-only"
        tabIndex={-1}
      >
        <option value="" />
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
};

// Legacy SelectField kept for any remaining use
const SelectField = ({ value, onChange, required, testId, children }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      required={required}
      data-testid={testId}
      className="w-full h-9 sm:h-11 rounded-xl border border-border bg-input px-3 sm:px-4 pr-8 sm:pr-10 text-xs sm:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
    >
      {children}
    </select>
    <ChevronDown
      size={13}
      className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
    />
  </div>
);
