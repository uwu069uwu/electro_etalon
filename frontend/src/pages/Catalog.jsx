import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import API from "../api/axios";
import { ProductCard, ProductCardSkeleton } from "../components/ProductCard";
import { EmptyState } from "../components/EmptyState";
import { SEO } from "../components/SEO";
import { PackageX, Search, SlidersHorizontal, X } from "lucide-react";

export default function Catalog() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [active, setActive]         = useState("all");
  const [query, setQuery]           = useState("");
  const [filters, setFilters]       = useState({
    minPrice:    "",
    maxPrice:    "",
    inStockOnly: false,
    brand:       "",
    sort:        "new",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    (async () => {
      try {
        const [c, p] = await Promise.all([
          API.get("/categories"),
          API.get("/products"),
        ]);
        setCategories(c.data);
        setProducts(p.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const brands = useMemo(() => {
    const s = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(s).sort();
  }, [products]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Суммарный доступный сток товара по всем цветам */
  const getTotalStock = (p) => {
    if (p.colors?.length) {
      return p.colors.reduce(
        (sum, c) => sum + Math.max((c.stock || 0) - (c.reserved || 0), 0),
        0
      );
    }
    return Math.max((p.stock || 0) - (p.reserved || 0), 0);
  };

  /** Нормализуем category_id продукта в строку */
  const getCatId = (p) => {
    if (p.category)     return String(p.category?._id || p.category);
    if (p.category_id)  return String(p.category_id?._id || p.category_id);
    return null;
  };

  // ── Фильтрация ────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...products];

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q)
      );
    }

    if (filters.brand) {
      list = list.filter((p) => p.brand === filters.brand);
    }

    if (filters.minPrice) {
      list = list.filter((p) => p.price >= Number(filters.minPrice));
    }

    if (filters.maxPrice) {
      list = list.filter((p) => p.price <= Number(filters.maxPrice));
    }

    // ✅ правильная проверка стока — по цветам
    if (filters.inStockOnly) {
      list = list.filter((p) => getTotalStock(p) > 0);
    }

    if (filters.sort === "priceAsc")  list.sort((a, b) => a.price - b.price);
    if (filters.sort === "priceDesc") list.sort((a, b) => b.price - a.price);

    return list;
  }, [products, query, filters]);

  // ── Группировка по категориям ─────────────────────────────────────────────

  const grouped = useMemo(() => {
    const byCat = new Map();
    for (const cat of categories) {
      byCat.set(String(cat._id), []);
    }

    for (const p of filtered) {
      const catId = getCatId(p);

      if (catId && byCat.has(catId)) {
        byCat.get(catId).push(p);
      } else {
        // нет категории — кидаем в первую
        const fallback = categories[0]?._id;
        if (fallback) byCat.get(String(fallback))?.push(p);
      }
    }

    return byCat;
  }, [filtered, categories]);

  // ── Навигация ─────────────────────────────────────────────────────────────

  const scrollTo = (id) => {
    setActive(id);
    if (id === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = sectionRefs.current[id];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 150;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const resetFilters = () =>
    setFilters({ minPrice: "", maxPrice: "", inStockOnly: false, brand: "", sort: "new" });

  const activeFilters =
    !!filters.brand ||
    !!filters.minPrice ||
    !!filters.maxPrice ||
    filters.inStockOnly ||
    filters.sort !== "new";

  const isSearching = !!query || activeFilters;

  return (
    <>
      <SEO
        title="Каталог электроники"
        description="Каталог Electro Etalon — бытовая техника и электроника в Астане."
        path="/catalog"
      />
      <div>
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Каталог
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Все товары
          </h1>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию или бренду"
                className="w-full h-11 pl-11 pr-4 rounded-full border border-border bg-muted/40 text-sm focus:bg-background transition-colors"
                data-testid="catalog-search-input"
              />
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              data-testid="catalog-filters-toggle"
              className={`relative h-11 px-5 rounded-full border text-sm font-medium inline-flex items-center gap-2 transition-colors ${
                activeFilters
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted"
              }`}
            >
              <SlidersHorizontal size={14} />
              Фильтры
              {activeFilters && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          </div>

          {/* Filters panel */}
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-border bg-card p-4 sm:p-6"
              data-testid="catalog-filters-panel"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FilterBlock label="Цена от">
                  <input
                    type="number"
                    min="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    placeholder="0"
                    data-testid="filter-min-price"
                    className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm"
                  />
                </FilterBlock>
                <FilterBlock label="Цена до">
                  <input
                    type="number"
                    min="0"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    placeholder="∞"
                    data-testid="filter-max-price"
                    className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm"
                  />
                </FilterBlock>
                <FilterBlock label="Бренд">
                  <select
                    value={filters.brand}
                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                    data-testid="filter-brand"
                    className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm"
                  >
                    <option value="">Все</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </FilterBlock>
                <FilterBlock label="Сортировка">
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    data-testid="filter-sort"
                    className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm"
                  >
                    <option value="new">Сначала новые</option>
                    <option value="priceAsc">По цене: дешевле</option>
                    <option value="priceDesc">По цене: дороже</option>
                  </select>
                </FilterBlock>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filters.inStockOnly}
                    onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
                    data-testid="filter-in-stock"
                    className="h-4 w-4 rounded border-border"
                  />
                  Только в наличии
                </label>
                {activeFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    data-testid="filter-reset-btn"
                  >
                    <X size={13} /> Сбросить фильтры
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sticky categories */}
        <div
          className="sticky top-16 z-30 glass border-b border-border/60"
          data-testid="catalog-categories-sticky"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto scrollbar-none py-4">
              <CategoryPill
                label="Все"
                active={active === "all"}
                onClick={() => scrollTo("all")}
              />
              {categories.map((c) => (
                <CategoryPill
                  key={c._id}
                  label={c.name}
                  active={active === c._id}
                  onClick={() => scrollTo(c._id)}
                  testId={`cat-pill-${c.slug}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-8">
          <div className="flex flex-col gap-14">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon={PackageX}
              title="Пока товаров нет"
              description="Категории и товары появятся здесь, когда администратор их добавит."
            />
          ) : isSearching && filtered.length === 0 ? (
            // Поиск дал 0 результатов
            <EmptyState
              icon={Search}
              title="Ничего не найдено"
              description="Попробуйте изменить запрос или сбросить фильтры."
              action={
                <button
                  onClick={() => { setQuery(""); resetFilters(); }}
                  className="h-10 px-5 rounded-full border border-border text-sm hover:bg-muted transition"
                >
                  Сбросить
                </button>
              }
            />
          ) : isSearching ? (
            // При поиске — плоский список без категорий (нет пустых секций)
            <section>
              <div className="mb-6 flex items-end justify-between">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Результаты поиска
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filtered.length} {filtered.length === 1 ? "товар" : filtered.length < 5 ? "товара" : "товаров"}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>
            </section>
          ) : (
            // Обычный режим — по категориям
            categories.map((cat) => {
              const items = grouped.get(String(cat._id)) || [];
              // Скрываем пустые категории в обычном режиме только если нет товаров вообще
              if (items.length === 0) return null;

              return (
                <section
                  key={cat._id}
                  id={`category-${cat._id}`}
                  ref={(el) => (sectionRefs.current[cat._id] = el)}
                  data-testid={`catalog-section-${cat.slug}`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="mb-6 flex items-end justify-between"
                  >
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                      {cat.name}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {items.length} {items.length === 1 ? "товар" : items.length < 5 ? "товара" : "товаров"}
                    </span>
                  </motion.div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {items.map((p, i) => (
                      <ProductCard key={p._id} product={p} index={i} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
          </div>
        </div>
      </div>
    </>
  );
}

const FilterBlock = ({ label, children }) => (
  <div>
    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
      {label}
    </div>
    {children}
  </div>
);

const CategoryPill = ({ label, active, onClick, testId }) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    className={`shrink-0 h-9 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-all ${
      active
        ? "bg-foreground text-background"
        : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
    }`}
  >
    {label}
  </button>
);
