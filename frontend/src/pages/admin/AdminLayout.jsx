import React from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  Package,
  Layers,
  Image as ImgIcon,
  ShoppingCart,
  Settings as SettingsIcon,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { Logo } from "../../components/Logo";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";

const links = [
  { to: "/admin/products", label: "Товары", icon: Package },
  { to: "/admin/categories", label: "Категории", icon: Layers },
  { to: "/admin/banners", label: "Баннеры", icon: ImgIcon },
  { to: "/admin/orders", label: "Заказы", icon: ShoppingCart },
  { to: "/admin/cities", label: "Города", icon: MapPin },
  { to: "/admin/settings", label: "Настройки", icon: SettingsIcon },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-[240px_1fr] min-h-screen">
        <aside className="hidden lg:flex flex-col border-r border-border bg-card px-4 py-6">
          <Link to="/" className="px-2 pb-6 border-b border-border">
            <Logo />
          </Link>
          <nav className="mt-6 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`admin-nav-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 h-10 px-3 rounded-lg text-sm ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <l.icon size={15} />
                {l.label}
              </NavLink>
            ))}
          </nav>
          <Link
            to="/"
            className="mt-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2"
            data-testid="admin-exit-link"
          >
            <ArrowLeft size={13} /> Вернуться в магазин
          </Link>
        </aside>

        <main className="min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden border-b border-border bg-card">
            <div className="px-3 py-3 flex items-center justify-between gap-2">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      `shrink-0 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-full ${
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground"
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
              <button
                onClick={() => navigate("/")}
                className="shrink-0 text-xs sm:text-sm px-3 py-1.5 rounded-full border"
              >
                Главная
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
