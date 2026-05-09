import { sendEmail } from "../services/email.service.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 📩 отправка OTP
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000,
      },
      { upsert: true, returnDocument: "after" },
    );

    console.log("🔥 OTP:", otp);

    // 🔥 ВОТ ГЛАВНОЕ
    await sendEmail(email, "Код подтверждения", `Ваш код: ${otp}`);

    res.json({ message: "OTP sent" });
  } catch (error) {
    console.error("❌ sendOTP error:", error.message);
    res.status(500).json({ message: "Ошибка отправки" });
  }
};
// ✅ подтверждение + установка пароля
export const verifyOTP = async (req, res) => {
  const { email, otp, password, name } = req.body;

  const user = await User.findOne({ email });

  console.log("📧 EMAIL:", email);
  console.log("DB OTP:", user?.otp);
  console.log("INPUT OTP:", otp);

  if (!user || String(user.otp) !== String(otp)) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  const hash = await bcrypt.hash(password, 10);

  user.password = hash;
  user.name = name; // 🔥 ВОТ ЭТО ГЛАВНОЕ
  user.otp = null;
  user.otpExpires = null;

  await user.save();

  res.json({ message: "Registered successfully" });
};
// 🔑 login
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ message: "Wrong password" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
};

// 👤 получить текущего пользователя
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("getMe error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
// 🔑 Запрос OTP для сброса пароля
export const resetRequestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email обязателен" });

    const user = await User.findOne({ email });
    // Не раскрываем наличие аккаунта — всегда 200
    if (!user)
      return res.json({ message: "Если email зарегистрирован, код отправлен" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log("🔑 Reset OTP:", otp);
    await sendEmail(
      email,
      "Сброс пароля",
      `Ваш код для сброса пароля: ${otp}\n\nКод действителен 10 минут.`,
    );

    res.json({ message: "Если email зарегистрирован, код отправлен" });
  } catch (error) {
    console.error("❌ resetRequestOtp error:", error.message);
    res.status(500).json({ message: "Ошибка отправки" });
  }
};

// ✅ Подтверждение сброса и установка нового пароля
export const resetConfirm = async (req, res) => {
  try {
    const { email, code, new_password } = req.body;

    if (!email || !code || !new_password) {
      return res.status(400).json({ detail: "Заполните все поля" });
    }
    if (new_password.length < 6) {
      return res
        .status(400)
        .json({ detail: "Пароль должен быть минимум 6 символов" });
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
    console.error("❌ resetConfirm error:", error.message);
    res.status(500).json({ detail: "Ошибка сервера" });
  }
};
