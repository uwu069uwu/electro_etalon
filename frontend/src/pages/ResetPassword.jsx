import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
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

export default function ResetPassword() {
  const { resetRequest, resetConfirm } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    code: "",
    password: "",
    password2: "",
  });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const sendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetRequest(form.email);
      toast.success("Если email существует — код отправлен");
      setStep(2);
    } catch (err) {
      toast.error("Не удалось отправить код");
    } finally {
      setLoading(false);
    }
  };

  const confirm = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(form.code)) {
      toast.error("Введите 6-значный код из письма");
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
      await resetConfirm({
        email: form.email,
        code: form.code,
        new_password: form.password,
      });
      toast.success("Пароль обновлён — теперь войдите");
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Неверный код";
      toast.error(msg);
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
      await resetRequest(form.email);
      toast.success("Код отправлен снова");
      setForm((f) => ({ ...f, code: "" }));
    } catch {
      toast.error("Не удалось отправить код");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    /^\d{6}$/.test(form.code) &&
    form.password.length >= 6 &&
    form.password === form.password2;

  return (
    <>
      <SEO title="Восстановление пароля" path="/reset" />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-10"
        >
          <div className="flex flex-col items-center text-center">
            <Logo size={36} withText={false} />
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mt-4">
              Восстановление пароля
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1
                ? "Введите email от аккаунта"
                : `Код отправлен на ${form.email}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="r1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={sendCode}
                className="mt-8 space-y-4"
                data-testid="reset-step1-form"
              >
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  testId="reset-email"
                  icon={Mail}
                />
                <button
                  type="submit"
                  disabled={loading || !form.email}
                  data-testid="reset-send-code-btn"
                  className="mt-2 w-full h-11 rounded-full bg-foreground text-background font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Отправить код
                </button>
                <div className="text-center text-sm">
                  <Link
                    to="/login"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ← Вернуться к входу
                  </Link>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="r2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={confirm}
                className="mt-8 space-y-5"
                data-testid="reset-step2-form"
              >
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
                      data-testid="reset-code-otp"
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
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Отправить код ещё раз
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-4 border-t border-border">
                  <TextField
                    label="Новый пароль (мин. 6)"
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    testId="reset-password"
                    minLength={6}
                  />
                  <TextField
                    label="Повторите пароль"
                    type="password"
                    value={form.password2}
                    onChange={set("password2")}
                    testId="reset-password2"
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
                  disabled={loading || !canSubmit}
                  data-testid="reset-confirm-btn"
                  className="mt-2 w-full h-11 rounded-full bg-foreground text-background font-medium inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Сохранить новый пароль
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setForm((f) => ({ ...f, code: "" }));
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1"
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
        minLength={minLength}
        className={`w-full h-11 rounded-xl border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
          Icon ? "pl-10 pr-4" : "px-4"
        } ${error ? "border-destructive" : "border-border"}`}
      />
    </div>
    {error && <div className="mt-1.5 text-xs text-destructive">{error}</div>}
  </div>
);
