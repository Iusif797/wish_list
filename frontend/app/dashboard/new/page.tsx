"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function NewWishlistPage() {
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (!authLoading && !user) {
    router.push("/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const w = await api<{ id: string }>("/wishlists", {
        method: "POST",
        body: JSON.stringify({ name, occasion }),
      });
      router.push(`/wishlist/${w.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <header className="sticky top-0 z-50 glass border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 text-sm font-medium flex items-center gap-1 transition-colors w-fit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            Back
          </Link>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-10 animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">New wishlist</h1>
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-scale-in">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Birthday 2025"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Occasion</label>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                required
                placeholder="e.g. Birthday, New Year"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3.5 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-emerald-600 disabled:opacity-50 transition-all shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2"
          >
            {loading ? <span className="spinner border-white/30 border-t-white" /> : "Create"}
          </button>
        </form>
      </main>
    </div>
  );
}
