import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendOrderNotification } from "../services/telegram.service.js";

export const createOrder = async (req, res) => {
  try {
    const {
      customer_name,
      email,
      phone,
      address,
      city,
      district,
      is_free_delivery,
      comment,
      items,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ detail: "Корзина пуста" });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const discount_percent = 5;
    const discount_amount = Math.round(subtotal * (discount_percent / 100));
    const total = subtotal - discount_amount;

    // Deduct stock (color-specific)
    for (const item of items) {
      if (item.product_id) {
        const product = await Product.findById(item.product_id).catch(() => null);
        if (product) {
          if (item.color && product.colors?.length > 0) {
            const colorIdx = product.colors.findIndex((c) => c.name === item.color);
            if (colorIdx >= 0) {
              product.colors[colorIdx].stock = Math.max(
                0,
                (product.colors[colorIdx].stock || 0) - item.qty
              );
              product.markModified("colors");
              await product.save().catch(() => {});
            }
          } else {
            await Product.findByIdAndUpdate(item.product_id, {
              $inc: { stock: -item.qty },
            }).catch(() => {});
          }
        }
      }
    }

    const order = await Order.create({
      customer_name,
      email,
      phone,
      address,
      city,
      district,
      is_free_delivery: !!is_free_delivery,
      comment,
      items,
      subtotal,
      discount_percent,
      discount_amount,
      total,
      status: "new",
    });

    // Telegram notification
    const itemLines = items
      .map((i) =>
        `  • ${i.name}${i.color ? ` (${i.color})` : ""}${i.brand ? ` — ${i.brand}` : ""} × ${i.qty} = ${(i.price * i.qty).toLocaleString("ru-RU")} ₸`
      )
      .join("\n");

    const deliveryLine = is_free_delivery
      ? "🚚 Доставка: Бесплатно"
      : "🚚 Доставка: Договорная";

    const tgMsg = [
      `🛒 Новый заказ №${order.orderNumber}`,
      "",
      `👤 ${customer_name}`,
      phone ? `📞 ${phone}` : null,
      email ? `📧 ${email}` : null,
      city ? `🏙 Город: ${city}${district ? `, ${district}` : ""}` : null,
      address ? `📍 ${address}` : null,
      comment ? `💬 ${comment}` : null,
      deliveryLine,
      "",
      "Товары:",
      itemLines,
      "",
      subtotal !== total
        ? `Сумма: ${subtotal.toLocaleString("ru-RU")} ₸\nСкидка ${discount_percent}%: −${discount_amount.toLocaleString("ru-RU")} ₸\n💰 Итого: ${total.toLocaleString("ru-RU")} ₸`
        : `💰 Итого: ${total.toLocaleString("ru-RU")} ₸`,
    ]
      .filter((l) => l !== null)
      .join("\n");

    await sendOrderNotification(tgMsg, order._id.toString());

    res.json(order);
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ detail: "Ошибка при создании заказа" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["new", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ detail: "Недопустимый статус" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ detail: "Заказ не найден" });

    const prevStatus = order.status;

    // If cancelling → restore stock
    if (status === "cancelled" && prevStatus !== "cancelled") {
      for (const item of order.items) {
        if (item.product_id) {
          const product = await Product.findById(item.product_id).catch(() => null);
          if (product) {
            // Restore color stock if applicable
            if (item.color && product.colors?.length > 0) {
              const colorIdx = product.colors.findIndex(
                (c) => c.name === item.color
              );
              if (colorIdx >= 0) {
                product.colors[colorIdx].stock = Math.max(
                  0,
                  (product.colors[colorIdx].stock || 0) + item.qty
                );
                product.markModified("colors");
                await product.save().catch(() => {});
              }
            }
            // Always restore general stock
            await Product.findByIdAndUpdate(item.product_id, {
              $inc: { stock: item.qty },
            }).catch(() => {});
          }
        }
      }
    }

    // If restoring from cancelled → deduct stock again
    if (prevStatus === "cancelled" && status !== "cancelled") {
      for (const item of order.items) {
        if (item.product_id) {
          await Product.findByIdAndUpdate(item.product_id, {
            $inc: { stock: -item.qty },
          }).catch(() => {});
        }
      }
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ detail: "Ошибка обновления статуса" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ detail: "Ошибка получения заказов" });
  }
};
