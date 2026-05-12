import { sendEmail } from "../services/email.service.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: `${process.env.JWT_EXPIRES_HOURS || 168}h` }
  );

// 📩 Запрос OTP для регистрации
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email обязателен" });

    const existing = await User.findOne({ email, password: { $exists: true, $ne: null } });
    if (existing) {
      return res.status(400).json({ message: "Аккаунт с этим email уже существует" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.findOneAndUpdate(
      { email },
      { email, otp, otpExpires: Date.now() + 10 * 60 * 1000 },
      { upsert: true, new: true }
    );

    console.log("🔥 OTP:", otp);
    sendEmail(email, "Код подтверждения — Electro Etalon", `Ваш код подтверждения: <b style="font-size:24px">${otp}</b><br><br>Код действителен 10 минут.`);

    res.json({ message: "Код отправлен", otp });
  } catch (err) {
    console.error("sendOTP error:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// ✅ Подтверждение OTP + регистрация
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return res.status(400).json({ message: "Заполните все поля" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Сначала запросите код" });
    }
    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: "Неверный код" });
    }
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Код истёк — запросите новый" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.name = name;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error("verifyOTP error:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// 🔑 Вход
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password: { $exists: true, $ne: null } });
    if (!user) {
      return res.status(400).json({ message: "Аккаунт с этим email ещё не зарегистрирован" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error("login error:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// 👤 Текущий пользователь
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// 🔑 Запрос OTP для сброса пароля
export const resetRequestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email обязателен" });

    const user = await User.findOne({ email, password: { $exists: true, $ne: null } });
    if (!user) {
      return res.status(400).json({ message: "Аккаунт с этим email не найден" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log("🔑 Reset OTP:", otp);
    sendEmail(email, "Сброс пароля — Electro Etalon", `Ваш код для сброса пароля: <b style="font-size:24px">${otp}</b><br><br>Код действителен 10 минут.`);

    res.json({ message: "Код отправлен", otp });
  } catch (err) {
    console.error("resetRequestOtp error:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// ✅ Подтверждение сброса пароля
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
      return res.status(400).json({ detail: "Неверный код" });
    }
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ detail: "Код истёк — запросите новый" });
    }

    user.password = await bcrypt.hash(new_password, 10);
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Пароль успешно изменён" });
  } catch (err) {
    console.error("resetConfirm error:", err.message);
    res.status(500).json({ detail: "Ошибка сервера" });
  }
};
