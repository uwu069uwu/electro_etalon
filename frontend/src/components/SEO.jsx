import React from "react";
import { Helmet } from "react-helmet-async";

/** Per-page SEO tags. Uses Helmet to update <head> dynamically. */
export const SEO = ({
  title,
  description,
  image = "/logo.jpg",
  type = "website",
  path = "",
}) => {
  const fullTitle = title
    ? `${title} · Electro Etalon`
    : "Electro Etalon — Магазин электроники в Астане";
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}${path}`;
  const imgUrl = image.startsWith("http") ? image : `${origin}${image}`;
  const desc =
    description ||
    "Интернет-магазин электротехники. Оригинальные товары, 5% скидка онлайн, бесплатная доставка по Астане, Kaspi Red и рассрочка.";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imgUrl} />
      <meta property="og:site_name" content="Electro Etalon" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={imgUrl} />
    </Helmet>
  );
};
