import { create } from "zustand";
import API from "@/api/axios";

// Lazy import to avoid circular deps
const getCartStore = () => import("./shop").then((m) => m.useCart.getState());

export const useAuth = create((set, get) => ({
  user: null,
  token: localStorage.getItem("ee_token") || null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem("ee_token");
    if (!token) {
      // Init guest cart
      const { useCart } = await import("./shop");
      useCart.getState().initCart(null);
      set({ loading: false });
      return;
    }
    try {
      const { data } = await API.get("/auth/me");
      // Init user cart
      const { useCart } = await import("./shop");
      useCart.getState().initCart(data._id || data.id);
      set({ user: data, token, loading: false });
    } catch {
      localStorage.removeItem("ee_token");
      const { useCart } = await import("./shop");
      useCart.getState().initCart(null);
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    localStorage.setItem("ee_token", data.token);

    // Merge guest cart into user cart
    const { useCart } = await import("./shop");
    useCart.getState().mergeGuestCart(data.user._id || data.user.id);

    set({ user: data.user, token: data.token });

    // After login: check if there's a pending cart item to add
    const pendingRaw = sessionStorage.getItem("pendingCartItem");
    if (pendingRaw) {
      try {
        const pending = JSON.parse(pendingRaw);
        sessionStorage.removeItem("pendingCartItem");
        const { available, returnTo, ...item } = pending;
        useCart.getState().add(item, available || 9999);
        // Return to product page
        if (returnTo) {
          window._pendingReturnTo = returnTo;
        }
      } catch {}
    }

    return data.user;
  },

  logout: () => {
    localStorage.removeItem("ee_token");
    // Switch to guest cart (don't wipe user cart from localStorage)
    import("./shop").then(({ useCart }) => {
      useCart.getState().initCart(null);
    });
    set({ user: null, token: null });
  },

  registerRequestOtp: async (email) => {
    await API.post("/auth/register/request-otp", { email });
  },

  registerVerify: async (payload) => {
    const { data } = await API.post("/auth/register/verify", payload);
    localStorage.setItem("ee_token", data.token);
    const { useCart } = await import("./shop");
    useCart.getState().mergeGuestCart(data.user._id || data.user.id);
    set({ user: data.user, token: data.token });
    return data.user;
  },

  resetRequest: async (email) => {
    await API.post("/auth/reset/request-otp", { email });
  },

  resetConfirm: async (payload) => {
    await API.post("/auth/reset/confirm", payload);
  },
}));
