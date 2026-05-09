import React, { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../store/shop";

export const ThemeToggle = () => {
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);
  const apply = useTheme((s) => s.apply);
  useEffect(() => {
    apply(theme);
  }, [apply, theme]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Переключить тему"
      data-testid="theme-toggle-btn"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 text-foreground transition-colors hover:bg-muted"
    >
      <Sun
        size={16}
        className={`absolute transition-all duration-500 ${
          theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        size={16}
        className={`absolute transition-all duration-500 ${
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
};
