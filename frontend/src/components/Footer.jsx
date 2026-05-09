import React from "react";
import { Link } from "react-router-dom";
import { Instagram, MapPin, Phone, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";

const INSTAGRAM = "https://www.instagram.com/electro_etalon";
const WHATSAPP = "https://api.whatsapp.com/send/?phone=77718365454";
const ADDRESS = "Бөгенбай батыра 6/5, Астана, Казахстан 010000";
const PHONE_DISPLAY = "+7 771 836 54 54";

export const Footer = () => (
  <footer
    className="border-t border-border mt-24 bg-background"
    data-testid="site-footer"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <div className="col-span-2 md:col-span-1">
        <Logo />
        <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">
          Оригинальная электроника с гарантией. Доставка по Астане — бесплатно.
        </p>
        <div className="mt-5 flex items-center gap-2">
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            data-testid="footer-instagram"
            className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
          >
            <Instagram size={15} />
          </a>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            data-testid="footer-whatsapp"
            className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
          >
            <MessageCircle size={15} />
          </a>
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Магазин
        </div>
        <ul className="space-y-2 text-sm">
          <li><Link to="/catalog" className="hover:text-primary">Каталог</Link></li>
          <li><Link to="/favorites" className="hover:text-primary">Избранное</Link></li>
          <li><Link to="/cart" className="hover:text-primary">Корзина</Link></li>
          <li><Link to="/about" className="hover:text-primary">О нас</Link></li>
        </ul>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Оплата
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><span className="text-foreground font-medium">Kaspi Red</span></li>
          <li>Рассрочка 0-0-12</li>
          <li>Наличные / перевод</li>
          <li className="text-primary font-medium">5% скидка при онлайн-заказе</li>
        </ul>
      </div>

      <div className="col-span-2 md:col-span-1">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Контакты
        </div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
            <span>{ADDRESS}</span>
          </li>
          <li className="flex items-center gap-2">
            <Phone size={14} className="text-muted-foreground" />
            <a href={`tel:+77718365454`} className="hover:text-primary">
              {PHONE_DISPLAY}
            </a>
          </li>
          <li className="flex items-center gap-2">
            <MessageCircle size={14} className="text-muted-foreground" />
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              WhatsApp
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Instagram size={14} className="text-muted-foreground" />
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              @electro_etalon
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} Electro Etalon. Все права защищены.
    </div>
  </footer>
);

export { INSTAGRAM, WHATSAPP, ADDRESS, PHONE_DISPLAY };
