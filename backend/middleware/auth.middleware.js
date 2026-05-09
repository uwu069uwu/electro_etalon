import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  // Internal bypass for Telegram bot callbacks
  const internalSecret = process.env.INTERNAL_SECRET || "tg_internal";
  if (req.headers["x-internal-secret"] === internalSecret) {
    req.user = { role: "admin" };
    return next();
  }

  let token;

  // формат: Bearer TOKEN
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Нет токена" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Неверный токен" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Доступ запрещён" });
  }
};