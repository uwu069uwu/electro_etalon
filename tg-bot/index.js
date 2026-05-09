/**
 * ╔══════════════════════════════════════════════════════════╗
 *  Electro Etalon — Telegram Bot (Telegraf v4)
 *  Роли: ADMIN (по chat.id) и обычный пользователь
 *  Фичи: управление заказами, кнопки исчезают после нажатия
 * ╚══════════════════════════════════════════════════════════╝
 */

import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
import { connectDB, Order, Product } from "./db.js";
import mongoose from "mongoose";
dotenv.config();

// ─── ENV ────────────────────────────────────────────────────────────────────
const TOKEN        = process.env.TG_TOKEN;
const SITE_URL     = process.env.SITE_URL || "http://localhost:3000";

// Поддержка нескольких adminов: через запятую TG_ADMIN_CHAT_ID=111,222,333
const ADMIN_IDS = (process.env.TG_ADMIN_CHAT_ID || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!TOKEN) {
  console.error("❌ TG_TOKEN не указан в .env");
  process.exit(1);
}

// ─── Bot ────────────────────────────────────────────────────────────────────
const bot = new Telegraf(TOKEN);

// ─── DB ─────────────────────────────────────────────────────────────────────
await connectDB();
console.log("🤖 Electro Etalon Bot (v2) запущен");

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Проверяем, является ли пользователь админом */
const isAdmin = (ctx) => ADMIN_IDS.includes(String(ctx.chat?.id || ctx.from?.id));

/** Метка статуса заказа */
const statusLabel = (s) =>
  ({ new: "🆕 Новый", delivered: "✅ Доставлен", cancelled: "❌ Отменён" }[s] || s);

/** Форматируем заказ в читаемый текст */
const formatOrder = (o) => {
  const lines = [
    `📦 <b>Заказ №${o.orderNumber || o._id.toString().slice(-6).toUpperCase()}</b>`,
    `Статус: ${statusLabel(o.status)}`,
    "",
    `👤 ${o.customer_name}`,
    o.phone  ? `📞 ${o.phone}`   : null,
    o.email  ? `📧 ${o.email}`   : null,
    o.city   ? `🏙 ${o.city}${o.district ? `, ${o.district}` : ""}` : null,
    o.address ? `📍 ${o.address}` : null,
    o.comment ? `💬 ${o.comment}` : null,
  ].filter(Boolean);

  if (o.items?.length) {
    lines.push("");
    lines.push("<b>Товары:</b>");
    o.items.forEach((it) => {
      lines.push(
        `  • ${it.name}${it.color ? ` (${it.color})` : ""}${it.brand ? ` — ${it.brand}` : ""} × ${it.qty} = ${(it.price * it.qty).toLocaleString("ru-RU")} ₸`
      );
    });
    lines.push("");
    if (o.discount_amount > 0) {
      lines.push(`Подытог: ${(o.subtotal || 0).toLocaleString("ru-RU")} ₸`);
      lines.push(`Скидка ${o.discount_percent || 5}%: −${o.discount_amount.toLocaleString("ru-RU")} ₸`);
    }
    lines.push(`<b>💰 Итого: ${(o.total || 0).toLocaleString("ru-RU")} ₸</b>`);
  }

  return lines.join("\n");
};

/**
 * Кнопки управления заказом.
 * После нажатия кнопка ИСЧЕЗАЕТ — editMessageReplyMarkup обновит клавиатуру.
 */
const orderKeyboard = (order) => {
  const btns = [];
  if (order.status !== "delivered") {
    btns.push(Markup.button.callback("✅ Доставлен", `status:${order._id}:delivered`));
  }
  if (order.status !== "cancelled") {
    btns.push(Markup.button.callback("❌ Отменить",  `status:${order._id}:cancelled`));
  }
  if (order.status !== "new") {
    btns.push(Markup.button.callback("🆕 В новые",  `status:${order._id}:new`));
  }
  return btns.length ? Markup.inlineKeyboard([btns]) : Markup.inlineKeyboard([]);
};

/** Отправляем список заказов по фильтру */
const sendOrderList = async (ctx, statusFilter) => {
  try {
    const query = statusFilter ? { status: statusFilter } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(15);

    if (orders.length === 0) {
      return ctx.replyWithHTML("📭 <b>Заказов нет.</b>");
    }

    for (const o of orders) {
      await ctx.replyWithHTML(formatOrder(o), orderKeyboard(o));
    }
  } catch (err) {
    ctx.reply("❌ Ошибка: " + err.message);
  }
};

// ─── /start ─────────────────────────────────────────────────────────────────

bot.start(async (ctx) => {
  if (isAdmin(ctx)) {
    // Администратор видит меню команд
    await ctx.replyWithHTML(
      `👋 <b>Electro Etalon — Панель администратора</b>\n\n` +
      `Доступные команды:\n\n` +
      `📦 /orders — все заказы (последние 15)\n` +
      `🆕 /new — новые заказы\n` +
      `✅ /delivered — доставленные\n` +
      `❌ /cancelled — отменённые\n` +
      `📊 /stats — статистика по заказам\n` +
      `📋 /producti — товары с остатками\n` +
      `💰 /pribil — прибыль за текущий месяц\n` +
      `📦 /sold — сколько товаров продано\n`,
      Markup.keyboard([
        ["📦 /orders", "🆕 /new"],
        ["✅ /delivered", "❌ /cancelled"],
        ["📊 /stats", "📋 /producti"],
        ["💰 /pribil", "📦 /sold"],
      ]).resize()
    );
  } else {
    // Обычный пользователь — просто приветствие + кнопка на сайт
    await ctx.replyWithHTML(
      `👋 <b>Добро пожаловать в Electro Etalon!</b>\n\n` +
      `Мы продаём качественную электротехнику с доставкой по Казахстану.\n` +
      `Нажмите кнопку ниже, чтобы открыть магазин:`,
      Markup.inlineKeyboard([
        Markup.button.url("🛍 Открыть магазин", SITE_URL),
      ])
    );
  }
});

// ─── Команды для ОБЫЧНОГО пользователя ──────────────────────────────────────

/** Middleware: блокируем все admin-команды для не-админов */
const adminOnly = (ctx, next) => {
  if (!isAdmin(ctx)) {
    return ctx.reply("⛔ Нет доступа.");
  }
  return next();
};

// ─── /orders, /new, /delivered, /cancelled ──────────────────────────────────

bot.command("orders",    adminOnly, (ctx) => sendOrderList(ctx, null));
bot.command("new",       adminOnly, (ctx) => sendOrderList(ctx, "new"));
bot.command("delivered", adminOnly, (ctx) => sendOrderList(ctx, "delivered"));
bot.command("cancelled", adminOnly, (ctx) => sendOrderList(ctx, "cancelled"));

// ─── /stats — статистика заказов ────────────────────────────────────────────

bot.command("stats", adminOnly, async (ctx) => {
  try {
    const all = await Order.find();
    const newOrders   = all.filter((o) => o.status === "new");
    const delivered   = all.filter((o) => o.status === "delivered");
    const cancelled   = all.filter((o) => o.status === "cancelled");
    const revenue     = delivered.reduce((s, o) => s + (o.total || 0), 0);
    const avgOrder    = delivered.length ? Math.round(revenue / delivered.length) : 0;

    // Топ товаров по продажам
    const productSales = {};
    delivered.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.name;
        productSales[key] = (productSales[key] || 0) + (it.qty || 0);
      });
    });
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, qty], i) => `  ${i + 1}. ${name} — ${qty} шт.`)
      .join("\n");

    await ctx.replyWithHTML(
      `📊 <b>Статистика Electro Etalon</b>\n\n` +
      `🆕 Новых: <b>${newOrders.length}</b>\n` +
      `✅ Доставлено: <b>${delivered.length}</b>\n` +
      `❌ Отменено: <b>${cancelled.length}</b>\n\n` +
      `💰 Выручка: <b>${revenue.toLocaleString("ru-RU")} ₸</b>\n` +
      `📈 Средний чек: <b>${avgOrder.toLocaleString("ru-RU")} ₸</b>\n` +
      (topProducts ? `\n🏆 <b>Топ товаров:</b>\n${topProducts}` : "")
    );
  } catch (err) {
    ctx.reply("❌ Ошибка: " + err.message);
  }
});

// ─── /producti — список товаров с остатками ──────────────────────────────────

bot.command("producti", adminOnly, async (ctx) => {
  try {
    const products = await Product.find().sort({ name: 1 }).limit(50);

    if (products.length === 0) {
      return ctx.replyWithHTML("📭 <b>Товаров нет.</b>");
    }

    const lines = products.map((p) => {
      // Суммируем остатки по всем цветам если есть
      const colorStock = p.colors?.length
        ? p.colors.map((c) => `  ${c.name}: ${c.stock ?? 0} шт.`).join("\n")
        : null;

      const totalStock = p.colors?.length
        ? p.colors.reduce((s, c) => s + (c.stock || 0), 0)
        : (p.stock || 0);

      return (
        `📦 <b>${p.name}</b>\n` +
        `   Цена: ${(p.price || 0).toLocaleString("ru-RU")} ₸ | ` +
        `Всего: ${totalStock} шт.\n` +
        (colorStock ? colorStock + "\n" : "")
      );
    });

    // Разбиваем на части по 10 товаров чтобы не превысить лимит сообщения
    const chunkSize = 10;
    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, i + chunkSize);
      await ctx.replyWithHTML(
        `📋 <b>Товары (${i + 1}–${Math.min(i + chunkSize, lines.length)} из ${lines.length}):</b>\n\n` +
        chunk.join("\n")
      );
    }
  } catch (err) {
    ctx.reply("❌ Ошибка: " + err.message);
  }
});

// ─── /pribil — прибыль за текущий месяц ─────────────────────────────────────

bot.command("pribil", adminOnly, async (ctx) => {
  try {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const delivered = await Order.find({
      status: "delivered",
      createdAt: { $gte: start, $lte: end },
    });

    const monthNames = [
      "Январь","Февраль","Март","Апрель","Май","Июнь",
      "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
    ];

    const revenue      = delivered.reduce((s, o) => s + (o.total || 0), 0);
    const subtotal     = delivered.reduce((s, o) => s + (o.subtotal || 0), 0);
    const savedByDisc  = subtotal - revenue;
    const ordersCount  = delivered.length;

    await ctx.replyWithHTML(
      `💰 <b>Прибыль за ${monthNames[now.getMonth()]} ${now.getFullYear()}</b>\n\n` +
      `✅ Заказов доставлено: <b>${ordersCount}</b>\n` +
      `💵 Сумма до скидок: ${subtotal.toLocaleString("ru-RU")} ₸\n` +
      `🎁 Скидки выданы: ${savedByDisc.toLocaleString("ru-RU")} ₸\n` +
      `\n<b>💰 Итого получено: ${revenue.toLocaleString("ru-RU")} ₸</b>`
    );
  } catch (err) {
    ctx.reply("❌ Ошибка: " + err.message);
  }
});

// ─── /sold — сколько товаров продано ────────────────────────────────────────

bot.command("sold", adminOnly, async (ctx) => {
  try {
    const delivered = await Order.find({ status: "delivered" });

    // Считаем по каждому товару
    const productStats = {};
    let totalQty = 0;

    delivered.forEach((o) => {
      (o.items || []).forEach((it) => {
        totalQty += it.qty || 0;
        const key = it.name;
        if (!productStats[key]) productStats[key] = { qty: 0, revenue: 0 };
        productStats[key].qty     += it.qty || 0;
        productStats[key].revenue += (it.price || 0) * (it.qty || 0);
      });
    });

    const sorted = Object.entries(productStats)
      .sort((a, b) => b[1].qty - a[1].qty);

    const lines = sorted.map(
      ([name, { qty, revenue }]) =>
        `  • <b>${name}</b>: ${qty} шт. — ${revenue.toLocaleString("ru-RU")} ₸`
    ).join("\n");

    await ctx.replyWithHTML(
      `📦 <b>Продано товаров всего: ${totalQty} шт.</b>\n\n` +
      (lines || "Нет данных")
    );
  } catch (err) {
    ctx.reply("❌ Ошибка: " + err.message);
  }
});

// ─── Inline-кнопки: смена статуса заказа ────────────────────────────────────
/**
 * После нажатия:
 * 1. Меняем статус в БД
 * 2. Редактируем текст сообщения (новый статус)
 * 3. Обновляем клавиатуру (нажатая кнопка исчезает)
 * 4. Показываем answerCallbackQuery — мигание кнопки пропадает
 */

bot.action(/^status:(.+):(.+)$/, async (ctx) => {
  // доступ только админам
  if (!isAdmin(ctx)) {
    return ctx.answerCbQuery("⛔ Нет доступа", { show_alert: true });
  }

  const [, orderId, newStatus] = ctx.match;

  // лог для отладки
  console.log("📩 callback_data:", ctx.callbackQuery.data);

  // ❗ ОБЯЗАТЕЛЬНАЯ защита
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    console.log("❌ Неверный ID:", orderId);
    return ctx.answerCbQuery("❌ Неверный ID", { show_alert: true });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return ctx.answerCbQuery("❌ Заказ не найден", { show_alert: true });
    }

    const prevStatus = order.status;

    // если статус не меняется — ничего не делаем
    if (prevStatus === newStatus) {
      return ctx.answerCbQuery("⚠️ Уже установлен этот статус");
    }

    // ─── ВОССТАНОВИТЬ СКЛАД (если отмена) ───
    if (newStatus === "cancelled" && prevStatus !== "cancelled") {
      for (const item of order.items || []) {
        if (!item.product_id) continue;

        const product = await Product.findById(item.product_id).catch(() => null);
        if (!product) continue;

        // по цвету
        if (item.color && product.colors?.length) {
          const ci = product.colors.findIndex(c => c.name === item.color);
          if (ci >= 0) {
            product.colors[ci].stock =
              (product.colors[ci].stock || 0) + (item.qty || 0);

            product.markModified("colors");
            await product.save().catch(() => {});
          }
        }

        // общий склад
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { stock: item.qty || 0 }
        }).catch(() => {});
      }
    }

    // ─── СПИСАТЬ СКЛАД (если вернули из отменённых) ───
    if (prevStatus === "cancelled" && newStatus !== "cancelled") {
      for (const item of order.items || []) {
        if (item.product_id) {
          await Product.findByIdAndUpdate(item.product_id, {
            $inc: { stock: -(item.qty || 0) }
          }).catch(() => {});
        }
      }
    }

    // обновляем статус
    order.status = newStatus;
    await order.save();

    // обновляем сообщение + кнопки
    await ctx.editMessageText(formatOrder(order), {
      parse_mode: "HTML",
      reply_markup: orderKeyboard(order).reply_markup,
    });

    // закрываем "часики" на кнопке
    await ctx.answerCbQuery(`✅ Статус → ${statusLabel(newStatus)}`);

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    await ctx.answerCbQuery("❌ Ошибка: " + err.message, { show_alert: true });
  }
  console.log("📩 callback_data:", ctx.callbackQuery.data);
});

// ─── Уведомление о новом заказе (вызывается из backend) ─────────────────────
// Экспортируем функцию, чтобы backend мог вызвать: sendOrderNotification(text, orderId)
// (используется в backend/services/telegram.service.js)

// ─── Graceful shutdown ───────────────────────────────────────────────────────

bot.on("polling_error", (err) => console.error("Polling error:", err.message));

process.once("SIGINT",  () => { bot.stop("SIGINT");  process.exit(0); });
process.once("SIGTERM", () => { bot.stop("SIGTERM"); process.exit(0); });

bot.launch();
console.log("✅ Bot polling started");
