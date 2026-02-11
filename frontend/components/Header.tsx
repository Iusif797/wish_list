"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="Wishlist" className="w-8 h-8 rounded-xl shadow-glow transition-shadow group-hover:shadow-glow-lg" />
          <span className="text-lg font-bold text-slate-900">Wishlist</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-emerald-400 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{(user.name || user.email)[0].toUpperCase()}</span>
              </div>
              <span className="text-sm text-slate-600 font-medium">{user.name || user.email}</span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-slate-500 hover:text-red-500 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 px-4 py-2 rounded-xl hover:bg-primary-50 transition-all"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
