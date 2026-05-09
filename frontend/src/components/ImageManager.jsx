import React, { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import API, { fileUrl } from "../api/axios";import { toast } from "sonner";

/**
 * Image uploader + URL input for admin.
 * value: string[] — list of URLs (absolute or /api/files/...)
 * onChange: (urls: string[]) => void
 */
export const ImageManager = ({ value = [], onChange, max = 8, label = "Изображения" }) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const upload = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const uploaded = [];
      for (const f of files) {
        const form = new FormData();
        form.append("file", f);
        const { data } = await API.post("/upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploaded.push(data.url);
      }
      onChange([...value, ...uploaded].slice(0, max));
      toast.success(`Загружено: ${uploaded.length}`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Ошибка загрузки");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const addUrl = () => {
    const u = urlInput.trim();
    if (!u) return;
    onChange([...value, u].slice(0, max));
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-xs text-muted-foreground">
          {value.length}/{max}
        </span>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {value.map((u, i) => (
            <div
              key={`${u}-${i}`}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
            >
              <img
                src={fileUrl(u)}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/90 border border-border opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                data-testid={`image-remove-${i}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || value.length >= max}
          className="inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-dashed border-border px-4 text-sm hover:bg-muted transition-colors disabled:opacity-50"
          data-testid="image-upload-btn"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Загрузить фото
        </button>
        <div className="flex-1 flex gap-2">
          <input
            type="url"
            placeholder="Или вставить URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 h-10 rounded-lg border border-border bg-input px-3 text-sm"
            data-testid="image-url-input"
          />
          <button
            type="button"
            onClick={addUrl}
            disabled={!urlInput.trim() || value.length >= max}
            className="h-10 px-4 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-50"
            data-testid="image-url-add-btn"
          >
            Добавить
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => upload(Array.from(e.target.files || []))}
      />
    </div>
  );
};
