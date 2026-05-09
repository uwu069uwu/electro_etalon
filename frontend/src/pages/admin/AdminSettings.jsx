import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, MapPin, ExternalLink } from "lucide-react";
import API, { fileUrl } from "../../api/axios";
import { ImageManager } from "../../components/ImageManager";

export default function AdminSettings() {
  const [data, setData] = useState({
    title: "О нас",
    text: "",
    gallery: [],
    phone: "",
    email: "",
    address: "",
    map_lat: "51.1282",
    map_lng: "71.4306",
    map_zoom: "15",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/settings/about").then(({ data: resp }) =>
      setData((d) => ({
        ...d,
        ...resp,
        map_lat: String(resp?.map_lat ?? d.map_lat),
        map_lng: String(resp?.map_lng ?? d.map_lng),
        map_zoom: String(resp?.map_zoom ?? d.map_zoom),
      }))
    );
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await API.put("/settings/about", {
        ...data,
        map_lat: parseFloat(data.map_lat) || 51.1282,
        map_lng: parseFloat(data.map_lng) || 71.4306,
        map_zoom: parseInt(data.map_zoom) || 15,
      });
      toast.success("Сохранено");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const mapsLink = `https://www.openstreetmap.org/?mlat=${data.map_lat}&mlon=${data.map_lng}#map=${data.map_zoom}/${data.map_lat}/${data.map_lng}`;

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Админ</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Настройки «О нас»</h1>
      </div>

      <div className="max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
        <Row label="Заголовок">
          <input
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className="w-full h-11 rounded-lg border border-border bg-input px-3 text-sm"
            data-testid="admin-settings-title"
          />
        </Row>
        <Row label="Текст">
          <textarea
            value={data.text}
            onChange={(e) => setData({ ...data, text: e.target.value })}
            rows={6}
            className="w-full rounded-lg border border-border bg-input p-3 text-sm resize-none"
            data-testid="admin-settings-text"
          />
        </Row>

        <div className="grid sm:grid-cols-3 gap-4">
          <Row label="Телефон">
            <input
              value={data.phone || ""}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="w-full h-11 rounded-lg border border-border bg-input px-3 text-sm"
            />
          </Row>
          <Row label="Email">
            <input
              value={data.email || ""}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full h-11 rounded-lg border border-border bg-input px-3 text-sm"
            />
          </Row>
          <Row label="Адрес (текст)">
            <input
              value={data.address || ""}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              className="w-full h-11 rounded-lg border border-border bg-input px-3 text-sm"
            />
          </Row>
        </div>

        <ImageManager
          label="Галерея (до 8 фото)"
          value={data.gallery || []}
          onChange={(gallery) => setData({ ...data, gallery })}
        />

        {/* ── Map settings (user-friendly) ─────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-primary shrink-0" />
            <span className="text-sm font-medium">Расположение на карте</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Укажите координаты вашего магазина. Чтобы найти координаты — откройте{" "}
            <a
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              OpenStreetMap
            </a>
            , найдите нужное место, нажмите правой кнопкой → «Показать адрес» и скопируйте
            координаты из адресной строки браузера (после «#map=15/»).
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Широта (lat)</label>
              <input
                type="number"
                step="0.0001"
                value={data.map_lat}
                onChange={(e) => setData({ ...data, map_lat: e.target.value })}
                placeholder="51.1282"
                className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm"
                data-testid="admin-settings-map-lat"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Долгота (lng)</label>
              <input
                type="number"
                step="0.0001"
                value={data.map_lng}
                onChange={(e) => setData({ ...data, map_lng: e.target.value })}
                placeholder="71.4306"
                className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm"
                data-testid="admin-settings-map-lng"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Масштаб (1–18)</label>
              <input
                type="number"
                min="1"
                max="18"
                value={data.map_zoom}
                onChange={(e) => setData({ ...data, map_zoom: e.target.value })}
                placeholder="15"
                className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm"
              />
            </div>
          </div>

          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <ExternalLink size={12} />
            Просмотреть метку на карте
          </a>
        </div>

        <button
          onClick={save}
          disabled={saving}
          data-testid="admin-settings-save-btn"
          className="h-11 px-6 rounded-full bg-foreground text-background inline-flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Сохранить
        </button>
      </div>
    </div>
  );
}

const Row = ({ label, children }) => (
  <div>
    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
    {children}
  </div>
);
