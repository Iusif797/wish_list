"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getApiUrl, api } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthUrl, setOauthUrl] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(true);

  useEffect(() => {
    api<{ url: string }>("/auth/oauth/google")
      .then((res) => setOauthUrl(res.url))
      .catch(() => setOauthUrl(null))
      .finally(() => setOauthLoading(false));
  }, []);
  const { register } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, name || undefined);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
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
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-primary-50/30 to-emerald-100/60 dark:from-slate-950/85 dark:via-primary-950/40 dark:to-slate-950" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary-400/15 rounded-full blur-[80px]" />
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <img src="/logo.png" alt="Список желаний" className="w-11 h-11 rounded-2xl shadow-glow transition-transform group-hover:scale-105" />
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Список желаний</span>
        </Link>
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/60 shadow-card dark:shadow-card-dark">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Регистрация</h2>
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Необязательно"
                className="input-field"
              />
            </div>
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
                minLength={6}
                className="input-field"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <span className="spinner-premium spinner-premium-sm spinner-premium-light" /> : "Создать аккаунт"}
          </button>
          <div className="mt-4">
            {oauthLoading ? (
              <div className="w-full py-3.5 btn-secondary flex items-center justify-center gap-2 opacity-80">
                <span className="spinner border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-400 w-4 h-4" />
                Загрузка Google...
              </div>
            ) : oauthUrl ? (
              <a
                href={oauthUrl}
                className="w-full py-3.5 btn-secondary flex items-center justify-center gap-2 block"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Зарегистрироваться через Google
              </a>
            ) : (
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                Регистрация через Google не настроена
              </p>
            )}
          </div>
          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Войти
            </Link>
          </p>
        </form>
        <p className="mt-6 text-center">
          <Link href="/" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 text-sm transition-colors">На главную</Link>
        </p>
      </div>
    </div>
  );
}
