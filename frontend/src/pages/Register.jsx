import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../store/auth";
import { Logo } from "../components/Logo";
import { SEO } from "../components/SEO";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/ui/input-otp";

export default function Register() {
  const { registerRequestOtp, registerVerify } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    code: "",
    name: "",
    password: "",
    password2: "",
  });

  const set = (k) => (v) =>
    setForm((f) => ({ ...f, [k]: typeof v === "string" ? v : v.target.value }));

  const requestOtp = async (e) => {
    e.preventDefault();
    if (!form.email.includes("@")) {
      toast.error("Введите корректный email");
      return;
    }
    setLoading(true);
    try {
      await registerRequestOtp(form.email);
      toast.success("Код отправлен на email");
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Не удалось отправить код");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    // Strict client-side validation BEFORE sending
    if (!/^\d{6}$/.test(form.code)) {
      toast.error("Введите 6-значный код из письма");
      return;
    }
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error("Введите имя (минимум 2 символа)");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Пароль должен быть минимум 6 символов");
      return;
    }
    if (form.password !== form.password2) {
      toast.error("Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      await registerVerify({
        email: form.email,
        otp: form.code,
        name: form.name.trim(),
        password: form.password,
      });
      toast.success("Регистрация успешна!");
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Неверный код";
      toast.error(msg);
      // if code is invalid/expired, reset it to force re-entry
      if (msg.toLowerCase().includes("код")) {
        setForm((f) => ({ ...f, code: "" }));
      }
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    try {
      await registerRequestOtp(form.email);
      toast.success("Новый код отправлен");
      setForm((f) => ({ ...f, code: "" }));
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Не удалось отправить код");
    } finally {
      setLoading(false);
    }
  };

  const canSubmitStep2 =
    /^\d{6}$/.test(form.code) &&
    form.name.trim().length >= 2 &&
    form.password.length >= 6 &&
    form.password === form.password2;

  return (
    <>
      <SEO title="Регистрация" path="/register" />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-10"
        >
          <div className="flex flex-col items-center text-center">
            <Logo size={36} withText={false} />
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mt-4">
              {step === 1 ? "Регистрация" : "Введите код"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-[320px]">
              {step === 1
                ? "Введите email — мы отправим код для подтверждения"
                : `Код отправлен на ${form.email}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={requestOtp}
                className="mt-8 space-y-4"
                data-testid="register-step1-form"
              >
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  testId="register-email"
                  icon={Mail}
                  autoComplete="email"
                />
                <button
                  type="submit"
                  disabled={loading || !form.email}
                  data-testid="register-send-code-btn"
                  className="mt-4 w-full h-11 rounded-full bg-foreground text-background font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Получить код
                </button>
                <div className="text-center text-sm text-muted-foreground">
                  Уже есть аккаунт?{" "}
                  <Link
                    to="/login"
                    className="text-primary font-medium"
                    data-testid="register-to-login-link"
                  >
                    Войти
                  </Link>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={verify}
                className="mt-8 space-y-5"
                data-testid="register-step2-form"
              >
                {/* 6-slot OTP input */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-3 text-center">
                    Код из письма
                  </label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={form.code}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          code: (v || "").replace(/\D/g, "").slice(0, 6),
                        }))
                      }
                      pattern="[0-9]*"
                      inputMode="numeric"
                      autoFocus
                      data-testid="register-code-otp"
                    >
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="h-12 w-11 sm:w-12 text-lg font-semibold"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={resendCode}
                      disabled={loading}
                      data-testid="register-resend-code-btn"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                    >
                      Отправить код ещё раз
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-4 border-t border-border">
                  <TextField
                    label="Имя"
                    value={form.name}
                    onChange={set("name")}
                    testId="register-name"
                    autoComplete="name"
                    minLength={2}
                  />
                  <TextField
                    label="Пароль (мин. 6 символов)"
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    testId="register-password"
                    autoComplete="new-password"
                    minLength={6}
                  />
                  <TextField
                    label="Повторите пароль"
                    type="password"
                    value={form.password2}
                    onChange={set("password2")}
                    testId="register-password2"
                    autoComplete="new-password"
                    minLength={6}
                    error={
                      form.password2.length > 0 &&
                      form.password !== form.password2
                        ? "Пароли не совпадают"
                        : ""
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !canSubmitStep2}
                  data-testid="register-verify-btn"
                  className="mt-2 w-full h-11 rounded-full bg-foreground text-background font-medium inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Подтвердить и зарегистрироваться
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setForm((f) => ({ ...f, code: "" }));
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1"
                  data-testid="register-back-btn"
                >
                  <ArrowLeft size={13} /> Изменить email
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}

const TextField = ({
  label,
  type = "text",
  value,
  onChange,
  testId,
  icon: Icon,
  autoComplete,
  minLength,
  error,
}) => (
  <div>
    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        data-testid={testId}
        autoComplete={autoComplete}
        minLength={minLength}
        className={`w-full h-11 rounded-xl border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
          Icon ? "pl-10 pr-4" : "px-4"
        } ${error ? "border-destructive" : "border-border"}`}
      />
    </div>
    {error && (
      <div className="mt-1.5 text-xs text-destructive">{error}</div>
    )}
  </div>
);
