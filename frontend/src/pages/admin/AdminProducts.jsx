import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import API, { fileUrl } from "../../api/axios";
import { ImageManager } from "../../components/ImageManager";

const empty = {
  name: "",
  brand: "",
  description: "",
  category_id: "",
  price: 0,
  images: [],
  colors: [],
};

// нормализует продукт из API для редактирования
function normalizeForEdit(p) {
  return {
    ...p,
    // category может быть объектом (после populate) или строкой
    category_id:
      p.category_id ||
      (typeof p.category === "object" ? p.category?._id : p.category) ||
      "",
    colors: (p.colors || []).map((c) => ({
      ...c,
      id: c.id || c._id || crypto.randomUUID(),
      hex: c.hex || "#000000",
      stock: c.stock ?? "",
      reserved: c.reserved ?? 0,
      images: c.images || [],
    })),
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // LOAD
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        API.get("/products"),
        API.get("/categories"),
      ]);
      setProducts(p.data);
      setCategories(c.data);
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // NEW
  const openNew = () => {
    setEditing({
      ...empty,
      category_id: categories[0]?._id || categories[0]?.id || "",
    });
  };

  // SAVE
  const save = async () => {
    if (!editing.name.trim() || !editing.category_id) {
      toast.error("Заполните название и категорию");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...editing,
        name: editing.name.trim(),
        brand: editing.brand?.trim(),
        price: Number(editing.price) || 0,
        colors: (editing.colors || []).map((c) => ({
          name: c.name?.trim() || "",
          hex: c.hex || "#000000",
          stock: c.stock === "" ? 0 : Number(c.stock),
          reserved: Number(c.reserved) || 0,
          images: c.images || [],
        })),
      };

      if (editing._id) {
        await API.put(`/products/${editing._id}`, payload);
        toast.success("Обновлено");
      } else {
        await API.post("/products", payload);
        toast.success("Создано");
      }

      setEditing(null);
      load();
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const remove = async (id) => {
    if (!window.confirm("Удалить товар?")) return;
    setDeleting(id);
    try {
      await API.delete(`/products/${id}`);
      toast.success("Удалено");
      load();
    } catch {
      toast.error("Ошибка удаления");
    } finally {
      setDeleting(null);
    }
  };

  // COLORS
  const addColor = () => {
    setEditing((e) => ({
      ...e,
      colors: [
        ...(e.colors || []),
        {
          id: crypto.randomUUID(),
          name: "",
          hex: "#000000",
          stock: "",
          reserved: 0,
          images: [],
        },
      ],
    }));
  };

  const updColor = (i, patch) => {
    setEditing((e) => ({
      ...e,
      colors: e.colors.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    }));
  };

  const delColor = (i) => {
    setEditing((e) => ({
      ...e,
      colors: e.colors.filter((_, idx) => idx !== i),
    }));
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Товары</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2"
        >
          <Plus size={14} /> Новый
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <>
          {/* DESKTOP */}
          <div className="hidden sm:block">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="p-3 text-left">Товар</th>
                  <th className="p-3 text-left">Бренд</th>
                  <th className="p-3 text-center">Остаток</th>
                  <th className="p-3 text-right">Цена</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const img = p.images?.[0] || p.colors?.[0]?.images?.[0] || "";
                  return (
                    <tr key={p._id} className="border-b">
                      <td className="p-3">
                        <div className="flex gap-3 items-center">
                          <div className="h-12 w-12 rounded-lg overflow-hidden border">
                            {img && (
                              <img
                                src={fileUrl(img)}
                                className="w-full h-full object-cover"
                                alt={p.name}
                              />
                            )}
                          </div>
                          <div>{p.name}</div>
                        </div>
                      </td>
                      <td className="p-3">{p.brand}</td>
                      <td className="p-3 text-center">
                        {p.colors?.map((c, i) => {
                          const available = Math.max(
                            (c.stock || 0) - (c.reserved || 0),
                            0
                          );
                          return (
                            <div key={c.id || c._id || i}>
                              {c.name}:{" "}
                              <span
                                className={
                                  available > 0 ? "text-green-500" : "text-red-500"
                                }
                              >
                                {available}
                              </span>
                            </div>
                          );
                        })}
                      </td>
                      <td className="p-3 text-right">
                        {p.price?.toLocaleString()} ₸
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() =>
                              setEditing(normalizeForEdit(p))
                            }
                            className="h-9 w-9 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => remove(p._id)}
                            disabled={deleting === p._id}
                            className="h-9 w-9 rounded-full bg-red-100 text-red-500 flex items-center justify-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="sm:hidden space-y-2">
            {products.map((p) => {
              const img = p.images?.[0] || p.colors?.[0]?.images?.[0] || "";
              return (
                <div
                  key={p._id}
                  className="flex items-center gap-3 p-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm active:scale-[0.98] transition"
                >
                  <div className="h-12 w-12 rounded-lg overflow-hidden border shrink-0">
                    {img && (
                      <img
                        src={fileUrl(img)}
                        className="w-full h-full object-cover"
                        alt={p.name}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-[11px] text-gray-500 truncate">{p.brand}</div>
                    <div className="text-sm font-semibold">
                      {p.price?.toLocaleString()} ₸
                    </div>
                  </div>
                  <div className="text-[10px] text-right">
                    {p.colors?.slice(0, 2).map((c, i) => {
                      const available = Math.max(
                        (c.stock || 0) - (c.reserved || 0),
                        0
                      );
                      return (
                        <div key={i}>
                          <span className="text-gray-400">{c.name}:</span>{" "}
                          <span
                            className={available > 0 ? "text-green-500" : "text-red-500"}
                          >
                            {available}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setEditing(normalizeForEdit(p))
                      }
                      className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => remove(p._id)}
                      disabled={deleting === p._id}
                      className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-500/10 text-red-500 flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditing(null)}
          />

          {/* modal */}
          <div className="relative bg-neutral-900 text-white rounded-2xl w-full max-w-full sm:max-w-2xl h-full sm:h-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto border border-neutral-800">

            {/* header */}
            <div className="flex justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {editing._id ? "Редактировать" : "Новый товар"}
              </h2>
              <button onClick={() => setEditing(null)}>
                <X />
              </button>
            </div>

            {/* ── 1. ОСНОВНАЯ ИНФОРМАЦИЯ ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-400">Название</label>
                <input
                  value={editing.name || ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Название товара"
                  className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Бренд</label>
                <input
                  value={editing.brand || ""}
                  onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                  placeholder="Необязательно"
                  className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Категория</label>
                <select
                  value={editing.category_id || ""}
                  onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}
                  className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 mt-1"
                >
                  <option value="">Выбери</option>
                  {categories.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Цена</label>
                <input
                  type="number"
                  value={editing.price === 0 ? "" : editing.price}
                  onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                  placeholder="0"
                  className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 mt-1"
                />
              </div>
            </div>

            {/* ── 2. ВАРИАНТЫ (цвета) ── */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">Варианты</span>
                <button
                  onClick={addColor}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm flex items-center gap-1"
                >
                  <Plus size={14} /> Добавить вариант
                </button>
              </div>

              <div className="space-y-3">
                {(editing.colors || []).map((c, i) => (
                  <div
                    key={c.id || c._id || i}
                    className="p-3 rounded-xl bg-neutral-800 border border-neutral-700 space-y-3"
                  >
                    {/* TOP ROW: name + color + stock + delete */}
                    <div className="flex items-center gap-2">
                      {/* Color swatch picker */}
                      <label
                        className="h-8 w-8 rounded-md border border-neutral-600 cursor-pointer shrink-0 overflow-hidden"
                        style={{ backgroundColor: c.hex || "#000000" }}
                      >
                        <input
                          type="color"
                          value={c.hex || "#000000"}
                          onChange={(e) => updColor(i, { hex: e.target.value })}
                          className="opacity-0 w-0 h-0"
                        />
                      </label>

                      {/* Name */}
                      <input
                        value={c.name || ""}
                        onChange={(e) => updColor(i, { name: e.target.value })}
                        placeholder="белый / чёрный"
                        className="flex-1 h-8 px-2 rounded-md bg-neutral-900 border border-neutral-600 text-sm"
                      />

                      {/* Stock */}
                      <div className="flex flex-col items-center shrink-0">
                        <span className="text-[10px] text-gray-500 mb-0.5">Кол-во</span>
                        <input
                          type="number"
                          value={c.stock ?? ""}
                          onChange={(e) =>
                            updColor(i, {
                              stock:
                                e.target.value === "" ? "" : Number(e.target.value),
                            })
                          }
                          placeholder="0"
                          className="w-16 h-8 text-center rounded-md bg-neutral-900 border border-neutral-600 text-sm"
                        />
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => delColor(i)}
                        className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Photos */}
                    <div>
                      <div className="text-[11px] text-gray-400 mb-1">Фото варианта</div>
                      <ImageManager
                        value={c.images || []}
                        onChange={(imgs) => updColor(i, { images: imgs })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 3. SAVE ── */}
            <button
              onClick={save}
              disabled={saving}
              className="mt-6 w-full h-11 rounded-lg bg-white text-black font-medium hover:bg-gray-100 disabled:opacity-50 transition"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}