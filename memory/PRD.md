# Electro Etalon — PRD

## Problem Statement
Fullstack e-commerce store "Electro Etalon" for electronics, production-grade level (Kaspi / Amazon / Apple quality). Apple-style minimalism, dark mode, admin panel, OTP email auth, stock reservation logic, Telegram order notifications, Yandex map embed, image uploads.

## Tech stack (adapted to sandbox)
- Frontend: React (CRA) + Tailwind + shadcn/ui + Framer Motion + Swiper + Zustand
- Backend: FastAPI + MongoDB (Motor)
- Auth: Email OTP via Resend (with log-fallback when key not set) → bcrypt + JWT
- Images: Emergent Object Storage + URL fallback
- Notifications: Telegram bot (placeholder token in .env)

## Core requirements (stable)
1. Empty at first run — no seed data
2. Storefront: Hero swiper, sticky category nav with smooth scroll, responsive product grid (2/3/4), product page with color picker, cart, checkout
3. Auth: email → OTP → password → JWT; reset password via OTP
4. Stock logic: `available = stock - reserved`. order create → reserved+=; confirm → stock-=, reserved-=; cancel → reserved-= (or stock+= from confirmed)
5. Admin: CRUD products / categories (drag&drop) / banners / orders (status transitions) / about settings
6. Dark mode persisted in localStorage
7. About page: editable text + gallery + Yandex iframe

## Implemented (2026-02-18)
- Backend REST API: auth (OTP/JWT), categories (CRUD+reorder), products (CRUD+stock), banners (CRUD+reorder), orders (create+status transitions), settings (about), uploads (object storage), /api/files serve
- Frontend: Home (hero with fallback + features + latest), Catalog (sticky pills + smooth scroll per category), Product (gallery + color swap + qty), Cart (persisted), Checkout (form + success screen), Favorites, About, Login/Register/Reset (OTP flow), Admin panel (Products, Categories, Banners, Orders, Settings)
- Dark/Light mode with 350ms transitions, zustand persisted
- Toast notifications via sonner
- Responsive grid 2/3/4 cols

## Architecture
- `backend/server.py` → routers `auth/categories/products/banners/orders/uploads/settings`
- `backend/services/` → email_service (Resend), storage_service (Object Storage), telegram_service
- `frontend/src/` → pages + components + store (auth, cart, favorites, theme) + lib/api (axios instance)

## Backlog (P0)
- Post-deployment: promote first user to admin via mongo shell (documented in test_credentials.md)

## Backlog (P1)
- Pagination for catalog when > 200 products
- Admin order search/filter by customer
- Invoice PDF export

## Backlog (P2)
- Multi-language (EN/RU/KZ)
- Product reviews
- Coupons / promo codes
- Revenue analytics dashboard
