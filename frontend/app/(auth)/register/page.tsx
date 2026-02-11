"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      setError(err instanceof Error ? err.message : "Registration failed");
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
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40" />
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <img src="/logo.png" alt="Wishlist" className="w-10 h-10 rounded-xl shadow-glow" />
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">Wishlist</span>
        </Link>
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-6 text-slate-900">Create account</h2>
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-scale-in space-y-2">
              <p>{error}</p>
              {error.includes("недоступен") && (
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3.5 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-emerald-600 disabled:opacity-50 transition-all shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2"
          >
            {loading ? <span className="spinner border-white/30 border-t-white" /> : "Create account"}
          </button>
          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </p>
        </form>
        <p className="mt-6 text-center">
          <Link href="/" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
