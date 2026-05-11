import { sendEmail } from "../services/email.service.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 📩 отправка OTP
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Проверка — уже зарегистрирован?
    const existing = await User.findOne({ email, password: { $exists: true, $ne: null } });
    if (existing) {
      return res.status(400).json({ message: "Этот email уже зарегистрирован" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.findOneAndUpdate(
      { email },
      { email, otp, otpExpires: Date.now() + 10 * 60 * 1000 },
      { upsert: true, new: true }
    );

    console.log("🔥 OTP:", otp);
    sendEmail(email, "Код подтверждения", `Ваш код: <b>${otp}</b>`);

    res.json({ message: "OTP sent", otp });
  } catch (error) {
    console.error("❌ sendOTP error:", error.message);
    res.status(500).json({ message: "Ошибка отправки" });
  }
};

// ✅ подтверждение + установка пароля
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, password, name } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: "Неверный код" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Код истёк, запросите новый" });
    }

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    user.name = name;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: `${process.env.JWT_EXPIRES_HOURS || 168}h` }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error("❌ verifyOTP error:", error.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// 🔑 login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: `${process.env.JWT_EXPIRES_HOURS || 168}h` }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// 👤 получить текущего пользователя
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔑 Запрос OTP для сброса пароля
export const resetRequestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email обязателен" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "Если email зарегистрирован, код отправлен" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log("🔑 Reset OTP:", otp);
    sendEmail(email, "Сброс пароля", `Ваш код: <b>${otp}</b>`);

    res.json({ message: "Если email зарегистрирован, код отправлен", otp });
  } catch (error) {
    res.status(500).json({ message: "Ошибка отправки" });
  }
};

// ✅ Подтверждение сброса
export const resetConfirm = async (req, res) => {
  try {
    const { email, code, new_password } = req.body;

    if (!email || !code || !new_password) {
      return res.status(400).json({ detail: "Заполните все поля" });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ detail: "Пароль минимум 6 символов" });
    }

    const user = await User.findOne({ email });
    if (!user || String(user.otp) !== String(code)) {
      return res.status(400).json({ detail: "Неверный код подтверждения" });
    }
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ detail: "Код истёк. Запросите новый." });
    }

    const hash = await bcrypt.hash(new_password, 10);
    user.password = hash;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Пароль успешно обновлён" });
  } catch (error) {
    res.status(500).json({ detail: "Ошибка сервера" });
  }
};
