import { create } from "zustand";
import { persist } from "zustand/middleware";

/* 
  Cart logic:
  - Items stored in localStorage keyed by userId: ee_cart_<userId>
  - Guest cart is separate (ee_cart_guest) 
  - On login: guest items migrate to user cart, guest cart cleared
  - On logout: user cart saved in localStorage (persists), active cart cleared from memory
  - Items bought by another user get removed from cart on next open (stock check done in Cart.jsx)
*/

const getCartKey = (userId) => userId ? `ee_cart_${userId}` : "ee_cart_guest";

const loadCart = (userId) => {
  try {
    const raw = localStorage.getItem(getCartKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (userId, items) => {
  try {
    localStorage.setItem(getCartKey(userId), JSON.stringify(items));
  } catch {}
};

export const useCart = create((set, get) => ({
  items: [],
  _userId: null,

  // Call this on app init and on login/logout
  initCart: (userId) => {
    const items = loadCart(userId);
    set({ items, _userId: userId || null });
  },

  // On login: merge guest cart into user cart
  mergeGuestCart: (userId) => {
    const guestItems = loadCart(null);
    const userItems = loadCart(userId);

    // Merge: for each guest item add to user items
    const merged = [...userItems];
    for (const gItem of guestItems) {
      const idx = merged.findIndex(
        (i) => i.product_id === gItem.product_id && i.color === gItem.color
      );
      if (idx >= 0) {
        merged[idx] = {
          ...merged[idx],
          qty: Math.min(merged[idx].qty + gItem.qty, merged[idx].available || 9999),
        };
      } else {
        merged.push(gItem);
      }
    }

    // Clear guest cart
    localStorage.removeItem(getCartKey(null));
    saveCart(userId, merged);
    set({ items: merged, _userId: userId });
  },

  add: (item, maxAvailable) => {
    const { items, _userId } = get();
    const list = [...items];
    const idx = list.findIndex(
      (i) => i.product_id === item.product_id && i.color === item.color
    );
    if (idx >= 0) {
      const nextQty = Math.min(list[idx].qty + item.qty, maxAvailable);
      list[idx] = { ...list[idx], qty: nextQty, available: maxAvailable };
    } else {
      list.push({ ...item, available: maxAvailable });
    }
    saveCart(_userId, list);
    set({ items: list });
  },

  remove: (product_id, color) => {
    const { _userId } = get();
    const items = get().items.filter(
      (i) => !(i.product_id === product_id && i.color === color)
    );
    saveCart(_userId, items);
    set({ items });
  },

  setQty: (product_id, color, qty) => {
    const { _userId } = get();
    const items = get().items.map((i) =>
      i.product_id === product_id && i.color === color
        ? { ...i, qty: Math.max(1, Math.min(qty, i.available || 9999)) }
        : i
    );
    saveCart(_userId, items);
    set({ items });
  },

  // Remove items that are no longer in stock (call from Cart.jsx after fetching products)
  removeOutOfStock: (outOfStockKeys) => {
    const { _userId } = get();
    const items = get().items.filter(
      (i) => !outOfStockKeys.includes(`${i.product_id}_${i.color || ""}`)
    );
    saveCart(_userId, items);
    set({ items });
  },

  clear: () => {
    const { _userId } = get();
    saveCart(_userId, []);
    set({ items: [] });
  },

  count: () => get().items.reduce((s, i) => s + i.qty, 0),
  total: () => get().items.reduce((s, i) => s + i.qty * i.price, 0),
}));

export const useFavorites = create(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids.includes(id)
          ? get().ids.filter((x) => x !== id)
          : [...get().ids, id];
        set({ ids });
      },
      has: (id) => get().ids.includes(id),
    }),
    { name: "ee_favorites" }
  )
);

export const useTheme = create(
  persist(
    (set) => ({
      theme: "light",
      toggle: () =>
        set((s) => {
          const next = s.theme === "dark" ? "light" : "dark";
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", next === "dark");
          }
          return { theme: next };
        }),
      apply: (theme) => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
        set({ theme });
      },
    }),
    { name: "ee_theme" }
  )
);
