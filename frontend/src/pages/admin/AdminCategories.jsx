import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Pencil, GripVertical, Check, X } from "lucide-react";
import { toast } from "sonner";
import API, { fileUrl } from "../../api/axios";
export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  const slugify = (text) => {
    const map = {
      а: "a", б: "b", в: "v", г: "g", д: "d",
      е: "e", ё: "e", ж: "zh", з: "z", и: "i",
      й: "y", к: "k", л: "l", м: "m", н: "n",
      о: "o", п: "p", р: "r", с: "s", т: "t",
      у: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
      ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
      э: "e", ю: "yu", я: "ya"
    };

    return text
      .toLowerCase()
      .split("")
      .map((char) => map[char] || char)
      .join("")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const load = useCallback(async () => {
    const { data } = await API.get("/categories");
    setCats(data);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const createNew = () => setEditing({ name: "", slug: "", icon: "" });

  const save = async () => {
    if (!editing.name.trim() || !editing.slug.trim()) {
      toast.error("Заполните название и slug");
      return;
    }
    try {
      if (editing._id) {
        await API.put(`/categories/${editing._id}`, editing);
        toast.success("Обновлено");
      } else {
        await API.post("/categories", editing);
        toast.success("Создано");
      }
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Ошибка");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Удалить категорию?")) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success("Удалено");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Ошибка");
    }
  };

  // drag & drop reorder
  const onDragStart = (id) => setDraggingId(id);
  const onDragOver = (e, overId) => {
    e.preventDefault();
    if (!draggingId || draggingId === overId) return;
    const a = cats.findIndex((c) => c._id === draggingId);
    const b = cats.findIndex((c) => c._id === overId);
    if (a < 0 || b < 0) return;
    const next = [...cats];
    const [m] = next.splice(a, 1);
    next.splice(b, 0, m);
    setCats(next);
  };
  const onDragEnd = async () => {
    setDraggingId(null);
    try {
      await API.post("/categories/reorder", { ids: cats.map((c) => c._id) });
    } catch {
      toast.error("Не удалось сохранить порядок");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Админ</div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Категории</h1>
        </div>
        <button
          onClick={createNew}
          data-testid="admin-new-category-btn"
          className="h-10 px-4 rounded-full bg-foreground text-background text-sm font-medium inline-flex items-center gap-2"
        >
          <Plus size={14} /> Новая категория
        </button>
      </div>

      {cats.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Категорий ещё нет. Создайте первую.
        </div>
      ) : (
        <div className="space-y-2 max-w-2xl">
          {cats.map((c) => (
            <div
              key={c._id}
              draggable
              onDragStart={() => onDragStart(c._id)}
              onDragOver={(e) => onDragOver(e, c._id)}
              onDragEnd={onDragEnd}
              data-testid={`admin-category-row-${c.slug}`}
              className={`flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted/30 transition-colors ${draggingId === c._id ? "opacity-50" : ""
                }`}
            >
              <GripVertical size={14} className="text-muted-foreground cursor-grab" />
              <div className="flex-1">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">/{c.slug}</div>
              </div>
              <button
                onClick={() => setEditing(c)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-muted"
                data-testid={`admin-cat-edit-${c.slug}`}
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => remove(c._id)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-destructive/10 text-destructive"
                data-testid={`admin-cat-delete-${c.slug}`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold">
                {editing._id ? "Редактировать" : "Новая категория"}
              </h2>
              <button onClick={() => setEditing(null)} className="h-9 w-9 rounded-full hover:bg-muted inline-flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Название</span>
                <input
                  value={editing.name || ""}
                  onChange={(e) => {
                    const name = e.target.value;

                    setEditing({
                      ...editing,
                      name,
                      slug: slugify(name)
                    });
                  }}
                  className="mt-2 w-full h-11 rounded-lg border border-border bg-input px-3 text-sm"
                  data-testid="admin-cat-name"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Slug (латиница, без пробелов)</span>
                <input
                  value={editing.slug || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  className="mt-2 w-full h-11 rounded-lg border border-border bg-input px-3 text-sm"
                  data-testid="admin-cat-slug"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="h-10 px-5 rounded-full border border-border">
                Отмена
              </button>
              <button
                onClick={save}
                data-testid="admin-cat-save-btn"
                className="h-10 px-5 rounded-full bg-foreground text-background inline-flex items-center gap-2"
              >
                <Check size={14} /> Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
