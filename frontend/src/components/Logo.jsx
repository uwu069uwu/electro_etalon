import React from "react";

/**
 * Renders the Electro Etalon logo.
 * Always displays the branded image asset (public/logo.jpg).
 */
export const Logo = ({ size = 32, withText = true }) => (
  <div className="flex items-center gap-2.5 select-none">
    <img
      src="/logo.jpg"
      alt="Electro Etalon"
      width={size}
      height={size}
      loading="eager"
      className="rounded-full object-cover shadow-sm ring-1 ring-border"
      style={{ width: size, height: size }}
      data-testid="brand-logo-img"
    />
    {withText && (
      <span
        className="font-display text-[17px] font-semibold tracking-tight"
        data-testid="brand-logo-text"
      >
        Electro<span className="text-primary"> Etalon</span>
      </span>
    )}
  </div>
);
