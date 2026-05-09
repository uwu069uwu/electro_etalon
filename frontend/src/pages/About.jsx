import React, { useEffect, useMemo, useState } from "react";
import { Instagram, MessageCircle, MapPin, Phone, Truck, CreditCard, Percent } from "lucide-react";
import API, { fileUrl } from "../api/axios";
import { SEO } from "../components/SEO";
import { INSTAGRAM, WHATSAPP, ADDRESS, PHONE_DISPLAY } from "../components/Footer";

const DEFAULT_DATA = {
  title: "О нас",
  text: `Electro Etalon — магазин электроники в Астане. Мы отбираем только оригинальные товары от проверенных поставщиков и предлагаем честные цены.\n\nНаши принципы: качество, прозрачность и забота о клиенте. Приходите в наш шоурум или заказывайте онлайн — доставка по Астане бесплатно.`,
  gallery: [],
  phone: PHONE_DISPLAY,
  email: "",
  address: ADDRESS,
  map_lat: 51.1282,
  map_lng: 71.4306,
  map_zoom: 15,
};

// Leaflet map rendered as an iframe pointing to OpenStreetMap
function LeafletMap({ lat, lng, zoom = 15, label = "Electro Etalon" }) {
  // Use OpenStreetMap embed with marker
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.007}%2C${lng + 0.01}%2C${lat + 0.007}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="rounded-2xl overflow-hidden border border-border w-full min-h-[280px] relative">
      <iframe
        src={src}
        title="Карта магазина Electro Etalon"
        loading="lazy"
        className="w-full h-full min-h-[280px]"
        allowFullScreen
        referrerPolicy="no-referrer"
        data-testid="about-map-iframe"
        style={{ border: 0 }}
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-white/90 dark:bg-black/70 text-xs px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground transition"
      >
        Открыть карту ↗
      </a>
    </div>
  );
}

export default function About() {
  const [data, setData] = useState(DEFAULT_DATA);

  useEffect(() => {
    let alive = true;
    API
      .get("/settings/about")
      .then(({ data: resp }) => {
        if (!alive) return;
        setData({
          title: resp?.title || DEFAULT_DATA.title,
          text: resp?.text || DEFAULT_DATA.text,
          gallery: resp?.gallery?.length ? resp.gallery : DEFAULT_DATA.gallery,
          phone: resp?.phone || DEFAULT_DATA.phone,
          email: resp?.email || DEFAULT_DATA.email,
          address: resp?.address || DEFAULT_DATA.address,
          map_lat: resp?.map_lat ?? DEFAULT_DATA.map_lat,
          map_lng: resp?.map_lng ?? DEFAULT_DATA.map_lng,
          map_zoom: resp?.map_zoom ?? DEFAULT_DATA.map_zoom,
        });
      })
      .catch(() => {
        if (alive) setData(DEFAULT_DATA);
      });
    return () => { alive = false; };
  }, []);

  return (
    <>
      <SEO
        title="О нас"
        description="Electro Etalon в Астане — адрес, телефон, Instagram и WhatsApp. Бесплатная доставка по Астане, Kaspi Red и рассрочка."
        path="/about"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          О нас
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
          {data.title}
        </h1>

        <p className="mt-8 max-w-3xl text-base sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
          {data.text}
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PerkCard icon={Truck} title="Бесплатная доставка" sub="По Астане — без оплаты" />
          <PerkCard icon={Percent} title="5% скидка онлайн" sub="При заказе через сайт" accent />
          <PerkCard icon={CreditCard} title="Kaspi Red · Рассрочка" sub="Оплата удобным способом" />
        </div>

        {data.gallery?.length > 0 && (
          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6" data-testid="about-gallery">
            {data.gallery.map((img, i) => (
              <div key={`${img}-${i}`} className="rounded-2xl overflow-hidden aspect-[4/3] bg-muted">
                <img src={fileUrl(img)} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border p-6 space-y-5">
            <h3 className="font-display text-xl font-semibold tracking-tight">
              Контакты
            </h3>
            <ContactLine icon={MapPin} label="Адрес">{data.address}</ContactLine>
            <ContactLine icon={Phone} label="Телефон">
              <a href={`tel:${data.phone?.replace(/\s/g, '')}`} className="hover:text-primary">
                {data.phone}
              </a>
            </ContactLine>
            <ContactLine icon={MessageCircle} label="WhatsApp">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
                data-testid="about-whatsapp-link"
              >
                Написать в WhatsApp
              </a>
            </ContactLine>
            <ContactLine icon={Instagram} label="Instagram">
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
                data-testid="about-instagram-link"
              >
                @electro_etalon
              </a>
            </ContactLine>
          </div>

          <LeafletMap lat={data.map_lat} lng={data.map_lng} zoom={data.map_zoom} />
        </div>
      </div>
    </>
  );
}

const PerkCard = ({ icon: Icon, title, sub, accent = false }) => (
  <div className={`rounded-2xl border p-5 ${accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
    <div className={`h-10 w-10 rounded-full inline-flex items-center justify-center ${accent ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
      <Icon size={16} />
    </div>
    <div className="mt-3 font-medium">{title}</div>
    <div className="text-sm text-muted-foreground mt-0.5">{sub}</div>
  </div>
);

const ContactLine = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <div className="h-9 w-9 rounded-full bg-muted inline-flex items-center justify-center shrink-0">
      <Icon size={14} />
    </div>
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm sm:text-base break-words">{children}</div>
    </div>
  </div>
);
