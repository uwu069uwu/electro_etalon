import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Headphones,
  CreditCard,
  Percent,
  Wallet,
} from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import API, { fileUrl } from "../api/axios";
import { ProductCard, ProductCardSkeleton } from "../components/ProductCard";
import { EmptyState } from "../components/EmptyState";
import { SEO } from "../components/SEO";

const HeroFallback = () => (
  <div className="relative overflow-hidden rounded-3xl h-[280px] sm:h-[420px] lg:h-[520px] bg-gradient-to-br from-muted via-background to-muted border border-border flex items-center">
    <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(hsl(var(--foreground))_1px,transparent_1px)] [background-size:24px_24px]" />
    <div className="relative px-6 sm:px-12 lg:px-16 max-w-xl">
      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary mb-3">
        <Sparkles size={11} /> Магазин в Астане
      </div>
      <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
        Электроника уровня{" "}
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Etalon
        </span>
      </h1>
      <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-md">
        Оригинальные товары, Kaspi Red и рассрочка. Бесплатная доставка по Астане.
      </p>
      <Link
        to="/catalog"
        className="mt-5 inline-flex items-center gap-2 h-10 sm:h-11 px-5 sm:px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        data-testid="hero-catalog-btn"
      >
        Открыть каталог
        <ArrowRight size={14} />
      </Link>
    </div>
  </div>
);

// Compact perks strip — 2×2 grid on mobile, 4 cols on lg
const PerksStrip = () => (
  <section
    className="rounded-2xl sm:rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-secondary/5 p-4 sm:p-6 lg:p-8"
    data-testid="home-perks-strip"
  >
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      <Perk icon={Percent} accent title="5% скидка онлайн" sub="При заказе через сайт" />
      <Perk icon={Truck} title="Бесплатная доставка" sub="По Астане — без оплаты" />
      <Perk icon={CreditCard} title="Kaspi Red" sub="Оплата в рассрочку" />
      <Perk icon={Wallet} title="Рассрочка 0-0-12" sub="Без переплат" />
    </div>
  </section>
);

const Perk = ({ icon: Icon, title, sub, accent = false }) => (
  <div className="flex items-start gap-2 sm:gap-3">
    <div
      className={`h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full inline-flex items-center justify-center ${
        accent ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
      }`}
    >
      <Icon size={14} className="sm:hidden" />
      <Icon size={16} className="hidden sm:block" />
    </div>
    <div className="min-w-0">
      <div className="font-medium text-xs sm:text-sm leading-snug">{title}</div>
      <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-snug">{sub}</div>
    </div>
  </div>
);

// Smaller features grid on mobile
const Features = () => (
  <section
    className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
    data-testid="home-features"
  >
    {[
      { icon: Truck, title: "Быстрая доставка", sub: "От 1 дня по городу" },
      { icon: ShieldCheck, title: "Гарантия", sub: "Оригинал — подтверждено" },
      { icon: Headphones, title: "Поддержка 24/7", sub: "Решаем любой вопрос" },
      { icon: Sparkles, title: "Лучшие цены", sub: "Проверили — дешевле" },
    ].map((f, i) => (
      <motion.div
        key={f.title}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: i * 0.06 }}
        className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-neutral-800 p-3 sm:p-5 lg:p-6 bg-gray-50 dark:bg-neutral-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
      >
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
          <f.icon size={14} className="sm:hidden text-primary" />
          <f.icon size={18} className="hidden sm:block text-primary" />
        </div>
        <div className="mt-2 sm:mt-3 font-medium text-xs sm:text-sm lg:text-base">{f.title}</div>
        <div className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 leading-snug">{f.sub}</div>
      </motion.div>
    ))}
  </section>
);

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const [b, p, c] = await Promise.all([
          API.get("/banners"),
          API.get("/products", { params: { limit: 8 } }),
          API.get("/categories"),
        ]);
        setCategories(c.data);
        setBanners(b.data);
        setProducts(p.data);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Home: failed to load storefront data", err);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <SEO
        title="Магазин электроники в Астане"
        description="Electro Etalon — оригинальная электроника с гарантией. 5% скидка онлайн, бесплатная доставка по Астане, Kaspi Red и рассрочка 0-0-12."
        path="/"
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-10 space-y-6 sm:space-y-10 lg:space-y-14">
        {/* Hero */}
        <section data-testid="home-hero">
          {banners.length > 0 ? (
            <Swiper
              modules={[Autoplay, Pagination, Navigation, EffectFade]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              speed={900}
              pagination={{
                clickable: true,
                bulletClass: "swiper-bullet",
                bulletActiveClass: "swiper-bullet-active",
              }}
              loop={banners.length > 1}
              className="rounded-2xl sm:rounded-3xl overflow-hidden"
            >
              {banners.map((b) => (
                <SwiperSlide key={b._id}>
                  <Link
                    to={b.link || "/catalog"}
                    className="relative block h-[260px] sm:h-[420px] lg:h-[520px] bg-muted"
                  >
                    <img
                      src={fileUrl(b.image)}
                      alt={b.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute left-4 sm:left-12 bottom-6 sm:bottom-14 right-4 max-w-lg text-white">
                      <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight drop-shadow">
                        {b.title}
                      </h2>
                      {b.subtitle && (
                        <p className="mt-2 text-xs sm:text-base opacity-90">{b.subtitle}</p>
                      )}
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <HeroFallback />
          )}
        </section>

        <PerksStrip />
        <Features />

        {/* Products */}
        <section>
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <CategoryPill
              label="Все"
              active={activeCat === "all"}
              onClick={() => setActiveCat("all")}
            />
            {categories.map((c) => (
              <CategoryPill
                key={c._id}
                label={c.name}
                active={activeCat === c._id}
                onClick={() => setActiveCat(c._id)}
              />
            ))}
          </div>

          <div className="flex items-end justify-between mt-4 mb-4 sm:mb-6">
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 mb-1">
                Новинки
              </div>
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight">
                Свежие товары
              </h2>
            </div>
            <Link
              to="/catalog"
              className="text-xs sm:text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap"
              data-testid="home-view-all-link"
            >
              Весь каталог <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {products
                .filter((p) => activeCat === "all" ? true : p.category_id === activeCat)
                .map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
            </div>
          ) : (
            <EmptyState
              title="Пока товаров нет"
              description="Каталог в процессе наполнения. Загляните чуть позже."
            />
          )}
        </section>
      </div>
    </>
  );
}

const CategoryPill = ({ label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl whitespace-nowrap cursor-pointer transition text-xs sm:text-sm font-medium ${
      active
        ? "bg-primary text-white shadow-md"
        : "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:bg-primary hover:text-white"
    }`}
  >
    {label}
  </div>
);
