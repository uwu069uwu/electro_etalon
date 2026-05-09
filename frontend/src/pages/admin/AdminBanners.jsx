import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import API, { fileUrl } from "../../api/axios";
import { ImageManager } from "../../components/ImageManager";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const { data } = await API.get("/banners");
    setBanners(data);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!editing.title?.trim() || !editing.image) {
      toast.error("Заполните заголовок и изображение");
      return;
    }
    try {
      if (editing._id) {
        await API.put(`/banners/${editing._id}`, editing);
      } else {
        await API.post("/banners", editing);
      }
      toast.success("Сохранено");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Ошибка");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Удалить баннер?")) return;
    await API.delete(`/banners/${id}`);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Админ</div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Баннеры</h1>
        </div>
        <button
          onClick={() =>
            setEditing({ title: "", subtitle: "", image: "", link: "", active: true })
          }
          data-testid="admin-new-banner-btn"
          className="h-10 px-4 rounded-full bg-foreground text-background text-sm font-medium inline-flex items-center gap-2"
        >
          <Plus size={14} /> Новый баннер
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Баннеров нет.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div
              key={b._id}
              className="rounded-2xl border border-border bg-card overflow-hidden"
              data-testid={`admin-banner-row-${b._id}`}
            >
              <div className="aspect-[16/6] bg-muted">
                {b.image && (
                  <img src={fileUrl(b.image)} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{b.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{b.subtitle}</div>
                    <div className="mt-1 text-xs">
                      {b.active ? (
                        <span className="text-primary">● Активен</span>
                      ) : (
                        <span className="text-muted-foreground">○ Скрыт</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditing(b)}
                      className="h-8 w-8 rounded-full hover:bg-muted inline-flex items-center justify-center"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => remove(b._id)}
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive inline-flex items-center justify-center"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border p-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold">
                {editing._id ? "Редактировать" : "Новый баннер"}
              </h2>
              <button onClick={() => setEditing(null)} className="h-9 w-9 rounded-full hover:bg-muted inline-flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <Row label="Заголовок">
                <input
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  data-testid="admin-banner-title"
                  className="w-full h-11 rounded-lg border border-border bg-input px-3 text-sm"
                />
              </Row>
              <Row label="Подзаголовок">
                <input
                  value={editing.subtitle || ""}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                  className="w-full h-11 rounded-lg border border-border bg-input px-3 text-sm"
                />
              </Row>
              <Row label="Ссылка (URL или /catalog)">
                <input
                  value={editing.link || ""}
                  onChange={(e) => setEditing({ ...editing, link: e.target.value })}
                  className="w-full h-11 rounded-lg border border-border bg-input px-3 text-sm"
                />
              </Row>
              <ImageManager
                label="Изображение (1)"
                max={1}
                value={editing.image ? [editing.image] : [] }
                onChange={(imgs) => setEditing({ ...editing, image: imgs[0] || "" })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  data-testid="admin-banner-active"
                />
                Активен
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="h-10 px-5 rounded-full border border-border">
                Отмена
              </button>
              <button
                onClick={save}
                data-testid="admin-banner-save-btn"
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

const Row = ({ label, children }) => (
  <div>
    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
    {children}
  </div>
);
