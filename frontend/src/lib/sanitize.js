import DOMPurify from "dompurify";

// Allow-list of trusted iframe hosts for embedded maps.
const ALLOWED_MAP_HOSTS = [
  "yandex.com",
  "yandex.kz",
  "yandex.ru",
  "google.com",
  "maps.google.com",
  "2gis.kz",
  "2gis.com",
];

/**
 * Parses admin-supplied iframe HTML and extracts a validated src URL.
 * Returns null if the HTML does not contain an iframe from a trusted host.
 * The returned URL is safe to use directly as `<iframe src={...} />`.
 */
export const extractMapSrc = (rawHtml) => {
  if (!rawHtml || typeof rawHtml !== "string") return null;

  // 1. Sanitize first — strips script/onerror/etc. even if we later extract src.
  const clean = DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["src"],
    FORBID_TAGS: ["script", "object", "embed", "form", "style"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "srcdoc"],
  });

  // 2. Extract src= value from sanitized HTML.
  const m = clean.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (!m) return null;

  const srcRaw = m[1].trim();

  // 3. Enforce https and hostname allow-list.
  let parsed;
  try {
    parsed = new URL(srcRaw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  const host = parsed.hostname.toLowerCase();
  const ok = ALLOWED_MAP_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  if (!ok) return null;

  return parsed.toString();
};
