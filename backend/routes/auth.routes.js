import express from "express";
import { sendOTP, verifyOTP, login, getMe, resetRequestOtp, resetConfirm } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// регистрация
router.get("/me", protect, getMe);
router.post("/register/request-otp", sendOTP);
router.post("/register/verify", verifyOTP);

// старые маршруты (совместимость)
router.post("/send-otp", sendOTP);
router.post("/verify", verifyOTP);

router.post("/login", login);

// сброс пароля
router.post("/reset/request-otp", resetRequestOtp);
router.post("/reset/confirm", resetConfirm);

export default router;
