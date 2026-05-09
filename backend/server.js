import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import bannerRoutes from "./routes/banners.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import cityRoutes from "./routes/cities.routes.js";
import telegramRoutes from "./routes/telegram.routes.js";
import path from "path";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || "http://localhost:3000").split(","),
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/telegram", telegramRoutes);

app.use("/api/files", express.static(path.resolve("uploads")));

const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  console.log(`Server started on :${PORT}`);

  // Auto-register Telegram webhook if BACKEND_URL is set
  const backendUrl = process.env.BACKEND_URL;
  const tgToken = process.env.TG_TOKEN;
  if (backendUrl && tgToken) {
    try {
      const webhookUrl = `${backendUrl}/api/telegram/webhook`;
      const { data } = await (await import("axios")).default.post(
        `https://api.telegram.org/bot${tgToken}/setWebhook`,
        { url: webhookUrl }
      );
      console.log(`🤖 Telegram webhook set: ${webhookUrl}`, data.ok ? "✅" : data.description);
    } catch (e) {
      console.warn("⚠️  Could not set Telegram webhook:", e.message);
    }
  } else {
    console.log("ℹ️  Set BACKEND_URL in .env to enable Telegram inline buttons");
  }
});
