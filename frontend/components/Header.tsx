"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { GoogleAuthButton } from "./GoogleAuthButton";

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-700/60 shadow-soft">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="Список желаний" className="w-9 h-9 rounded-xl shadow-glow transition-all duration-200 group-hover:shadow-glow-lg group-hover:scale-105" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">Список желаний</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"
            aria-label="Переключить тему"
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
            )}
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center shadow-glow ring-2 ring-white/20 dark:ring-slate-800/50">
                  <span className="text-white text-xs font-semibold">{(user.name || user.email || "?")[0].toUpperCase()}</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{user.name || user.email}</span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <GoogleAuthButton
                label="Войти через Google"
                compact
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 flex items-center justify-center"
              />
              <Link
                href="/login"
                className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-5 py-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all duration-200"
              >
                Войти
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
