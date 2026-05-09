import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Menu, X, User, LogOut, Shield } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useCart, useFavorites } from "../store/shop";
import { useAuth } from "../store/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const NavItem = ({ to, label }) => (
  <NavLink
    to={to}
    data-testid={`nav-link-${label.toLowerCase()}`}
    className={({ isActive }) =>
      `text-sm font-medium transition-colors ${
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`
    }
  >
    {label}
  </NavLink>
);

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const cartCount = useCart((s) => s.count());
  const favCount = useFavorites((s) => s.ids.length);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header
        className="sticky top-0 z-50 glass border-b border-border/60"
        data-testid="site-navbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="nav-logo-link">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavItem to="/catalog" label="Каталог" />
            <NavItem to="/favorites" label="Избранное" />
            <NavItem to="/about" label="О нас" />
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              to="/favorites"
              className="relative hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
              aria-label="Избранное"
              data-testid="nav-favorites-btn"
            >
              <Heart size={16} />
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
              aria-label="Корзина"
              data-testid="nav-cart-btn"
            >
              <ShoppingBag size={16} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center"
                  data-testid="nav-cart-count"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-border pl-2 pr-2 hover:bg-muted transition-colors text-sm"
                    data-testid="nav-user-menu-trigger"
                  >
                    <span className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                      {(user.name || user.email).slice(0, 1).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {user.name || user.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === "admin" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/admin")}
                      data-testid="nav-admin-link"
                    >
                      <Shield size={14} className="mr-2" />
                      Админ-панель
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    data-testid="nav-logout-btn"
                  >
                    <LogOut size={14} className="mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex h-9 items-center gap-2 rounded-full border border-border px-3 hover:bg-muted transition-colors text-sm"
                data-testid="nav-login-btn"
              >
                <User size={14} />
                <span>Вход</span>
              </Link>
            )}

            <button
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted"
              onClick={() => setOpen(true)}
              aria-label="Открыть меню"
              data-testid="nav-burger-btn"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          data-testid="mobile-menu-overlay"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-background border-l border-border p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-border"
                onClick={() => setOpen(false)}
                data-testid="mobile-menu-close"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="flex flex-col divide-y divide-border mt-4">
              {[
                { to: "/catalog", label: "Каталог" },
                { to: "/favorites", label: "Избранное" },
                { to: "/about", label: "О нас" },
                { to: "/cart", label: "Корзина" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="py-4 text-base font-medium"
                  onClick={() => setOpen(false)}
                  data-testid={`mobile-nav-${l.label.toLowerCase()}`}
                >
                  {l.label}
                </Link>
              ))}
              {!user ? (
                <Link
                  to="/login"
                  className="py-4 text-base font-medium text-primary"
                  onClick={() => setOpen(false)}
                  data-testid="mobile-nav-login"
                >
                  Вход
                </Link>
              ) : (
                <>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="py-4 text-base font-medium"
                      onClick={() => setOpen(false)}
                      data-testid="mobile-nav-admin"
                    >
                      Админ-панель
                    </Link>
                  )}
                  <button
                    className="py-4 text-base font-medium text-left text-destructive"
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate("/");
                    }}
                    data-testid="mobile-nav-logout"
                  >
                    Выйти
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
