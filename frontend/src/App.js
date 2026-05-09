import React, { useEffect } from "react";
import "./index.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { WhatsAppFloat } from "./components/WhatsAppFloat";
import { useAuth } from "./store/auth";
import { useTheme } from "./store/shop";

import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCities from "./pages/admin/AdminCities";

function PublicLayout({ children }) {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="cities" element={<AdminCities />} />
      </Route>

      <Route
        path="/*"
        element={
          <PublicLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PublicLayout>
        }
      />
    </Routes>
  );
}

export default function App() {
  const init = useAuth((s) => s.init);
  const theme = useTheme((s) => s.theme);
  const apply = useTheme((s) => s.apply);

  useEffect(() => {
    apply(theme);
    init();
  }, [apply, init, theme]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppRoutes />
        <WhatsAppFloat />
        <Toaster
          position="bottom-right"
          theme={theme}
          closeButton
          richColors
          toastOptions={{ style: { borderRadius: "12px" } }}
        />
      </BrowserRouter>
    </HelmetProvider>
  );
}
