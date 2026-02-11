"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function AddItemPage() {
  const params = useParams();
  const id = params.id as string;
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (!authLoading && !user) {
    router.push("/login");
    return null;
  }

  async function handleFetchMeta() {
    if (!url.trim()) return;
    setFetching(true);
    setError("");
    try {
      const res = await api<{ title: string; image_url: string | null; price: number | null }>("/meta/fetch", {
        method: "POST",
        body: JSON.stringify({ url: url.trim() }),
      });
      setName(res.title);
      if (res.image_url) setImageUrl(res.image_url);
      if (res.price != null) setPrice(String(res.price));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch product info");
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api(`/wishlists/${id}/items`, {
        method: "POST",
        body: JSON.stringify({
          name,
          url,
          price: parseFloat(price) || 0,
          image_url: imageUrl || null,
          target_amount: targetAmount ? parseFloat(targetAmount) : null,
        }),
      });
      router.push(`/wishlist/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <header className="sticky top-0 z-50 glass border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <Link href={`/wishlist/${id}`} className="text-slate-500 hover:text-slate-900 text-sm font-medium flex items-center gap-1 transition-colors w-fit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            Back
          </Link>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-10 animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Add item</h1>
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-scale-in">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Product URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={handleFetchMeta}
                  disabled={fetching || !url.trim()}
                  className="px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {fetching ? <span className="spinner border-slate-400/30 border-t-slate-500 w-4 h-4" /> : "Fetch"}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Auto-fill name, image and price from URL</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (₽)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Target amount (₽) — for group gift</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                step="0.01"
                min="0"
                placeholder="Optional"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3.5 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-emerald-600 disabled:opacity-50 transition-all shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2"
          >
            {loading ? <span className="spinner border-white/30 border-t-white" /> : "Add item"}
          </button>
        </form>
      </main>
    </div>
  );
}
