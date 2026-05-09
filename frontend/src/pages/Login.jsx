import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "../store/auth";
import { Logo } from "../components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Добро пожаловать, ${user.name || user.email}`);
      // Check if we need to return somewhere specific
      const redirectTo = window._pendingReturnTo || sessionStorage.getItem("redirectAfterLogin") || state?.from || "/";
      window._pendingReturnTo = null;
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(redirectTo);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        data-testid="login-form"
        className="w-full max-w-md rounded-3xl border border-border bg-card p-8 sm:p-10"
      >
        <div className="flex flex-col items-center text-center">
          <Logo size={32} withText={false} />
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mt-4">
            Вход
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Войдите в аккаунт Electro Etalon
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Input label="Email" type="email" value={email} onChange={setEmail} testId="login-email" />
          <Input label="Пароль" type="password" value={password} onChange={setPassword} testId="login-password" />
        </div>

        <button
          type="submit"
          disabled={loading}
          data-testid="login-submit-btn"
          className="mt-8 w-full h-11 rounded-full bg-foreground text-background font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Войти
        </button>

        <div className="mt-6 text-center space-y-2 text-sm">
          <Link to="/reset" className="text-muted-foreground hover:text-foreground" data-testid="login-reset-link">
            Забыли пароль?
          </Link>
          <div>
            <span className="text-muted-foreground">Нет аккаунта? </span>
            <Link to="/register" className="text-primary font-medium" data-testid="login-register-link">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </motion.form>
    </div>
  );
}

const Input = ({ label, type = "text", value, onChange, testId }) => (
  <div>
    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      data-testid={testId}
      className="w-full h-11 rounded-xl border border-border bg-input px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
);
