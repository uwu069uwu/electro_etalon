import { sendEmail } from "../services/email.service.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 📩 ОТП ДЛЯ РЕГИСТРАЦИИ
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email обязателен",
      });
    }

    // ищем пользователя
    let user = await User.findOne({ email });

    // если уже зарегистрирован
    if (user && user.password) {
      return res.status(400).json({
        message: "Этот email уже зарегистрирован",
      });
    }

    // генерируем OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // если пользователя нет — создаём
    if (!user) {
      user = new User({
        email,
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000,
      });
    } else {
      // обновляем OTP
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000;
    }

    await user.save();

    console.log("🔥 OTP:", otp);

    await sendEmail(
      email,
      "Код подтверждения",
      `Ваш код: <b>${otp}</b>`
    );

    res.json({
      message: "OTP отправлен",
    });
  } catch (error) {
    console.error("❌ sendOTP error:", error);

    res.status(500).json({
      message: "Ошибка сервера",
    });
  }
};

// ✅ ПОДТВЕРЖДЕНИЕ OTP + РЕГИСТРАЦИЯ
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return res.status(400).json({
        message: "Заполните все поля",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Пароль минимум 6 символов",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Пользователь не найден",
      });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({
        message: "Неверный OTP",
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "OTP истёк",
      });
    }

    // хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.name = name;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    // JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: `${process.env.JWT_EXPIRES_HOURS || 168}h`,
      }
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
  } catch (error) {
    console.error("❌ verifyOTP error:", error);

    res.status(500).json({
      message: "Ошибка сервера",
    });
  }
};

// 🔑 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Заполните все поля",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({
        message: "Пользователь не найден",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Неверный пароль",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: `${process.env.JWT_EXPIRES_HOURS || 168}h`,
      }
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
  } catch (error) {
    console.error("❌ login error:", error);

    res.status(500).json({
      message: "Ошибка сервера",
    });
  }
};

// 👤 CURRENT USER
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ getMe error:", error);

    res.status(500).json({
      message: "Ошибка сервера",
    });
  }
};

// 🔑 OTP ДЛЯ СБРОСА ПАРОЛЯ
export const resetRequestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email обязателен",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message:
          "Если email существует — код отправлен",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    console.log("🔑 RESET OTP:", otp);

    await sendEmail(
      email,
      "Сброс пароля",
      `Ваш код: <b>${otp}</b>`
    );

    res.json({
      message: "OTP отправлен",
    });
  } catch (error) {
    console.error("❌ resetRequestOtp error:", error);

    res.status(500).json({
      message: "Ошибка сервера",
    });
  }
};

// ✅ ПОДТВЕРЖДЕНИЕ СБРОСА
export const resetConfirm = async (req, res) => {
  try {
    const { email, code, new_password } = req.body;

    if (!email || !code || !new_password) {
      return res.status(400).json({
        message: "Заполните все поля",
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        message: "Минимум 6 символов",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Пользователь не найден",
      });
    }

    if (String(user.otp) !== String(code)) {
      return res.status(400).json({
        message: "Неверный код",
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "Код истёк",
      });
    }

    const hashedPassword = await bcrypt.hash(
      new_password,
      10
    );

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({
      message: "Пароль обновлён",
    });
  } catch (error) {
    console.error("❌ resetConfirm error:", error);

    res.status(500).json({
      message: "Ошибка сервера",
    });
  }
};
