import React from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { WHATSAPP } from "./Footer";

/** Floating WhatsApp button — hidden on admin pages. */
export const WhatsAppFloat = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написать в WhatsApp"
      data-testid="whatsapp-float-btn"
      className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 flex items-center justify-center hover:scale-105 transition-transform"
    >
      <MessageCircle size={22} fill="currentColor" strokeWidth={0} />
    </a>
  );
};
