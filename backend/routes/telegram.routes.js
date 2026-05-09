import express from "express";
import { handleTelegramCallback } from "../services/telegram.service.js";

const router = express.Router();

// Telegram sends updates to this webhook
router.post("/webhook", async (req, res) => {
  const { callback_query } = req.body;
  if (callback_query) {
    await handleTelegramCallback(callback_query);
  }
  res.sendStatus(200); // Always 200 to Telegram
});

export default router;
