"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getApiUrl, api } from "@/lib/api";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url(/wishlist-bg.png)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-primary-50/30 to-indigo-100/60 dark:from-slate-950/85 dark:via-primary-950/40 dark:to-slate-950" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary-400/15 rounded-full blur-[80px]" />
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <img src="/logo.png" alt="Список желаний" className="w-11 h-11 rounded-2xl shadow-glow transition-transform group-hover:scale-105" />
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Список желаний</span>
        </Link>
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/60 shadow-card dark:shadow-card-dark">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Вход в аккаунт</h2>
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm animate-scale-in space-y-2">
              <p>{error}</p>
              {error.toLowerCase().includes("unavailable") && (
                <a
                  href={getApiUrl("/health")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary-600 hover:underline text-xs"
                >
                  Открыть в новой вкладке (подождите 1 мин) →
                </a>
              )}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Эл. почта</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full google-auth-btn disabled:opacity-50"
          >
            <span className="google-auth-btn__glow" />
            <span className="google-auth-btn__content">
              {loading ? (
                <span className="spinner-premium spinner-premium-sm spinner-premium-light" />
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  <span>Войти</span>
                </>
              )}
            </span>
          </button>
          <div className="mt-4">
            <GoogleAuthButton label="Войти через Google" />
          </div>
          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Зарегистрироваться
            </Link>
          </p>
        </form>
        <p className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all" aria-label="На главную">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
          </Link>
        </p>
      </div>
    </div>
  );
}
