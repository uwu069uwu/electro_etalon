import axios from "axios";

const getBot = () => ({
  token: process.env.TG_TOKEN,
  chatId: process.env.TG_CHAT_ID,
});

// Простое текстовое сообщение
export const sendTelegramMessage = async (text) => {
  try {
    const { token, chatId } = getBot();
    if (!token || !chatId) { console.warn("⚠️  TG_TOKEN or TG_CHAT_ID not set"); return; }
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    });
    console.log("📲 Telegram message sent");
  } catch (error) {
    console.error("Telegram error:", error.message);
  }
};

// Уведомление о новом заказе — без кнопок, просто текст
export const sendOrderNotification = async (text, orderId) => {
  try {
    const { token, chatId } = getBot();
    if (!token || !chatId) { console.warn("⚠️  TG_TOKEN or TG_CHAT_ID not set"); return; }

    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    });

    console.log("📲 Telegram order notification sent");
  } catch (error) {
    console.error("Telegram error:", error.message);
  }
};

// Оставляем для совместимости с telegram.routes.js
export const handleTelegramCallback = async (callbackQuery) => {};
