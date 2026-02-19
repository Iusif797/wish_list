"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function EditItemPage() {
  const params = useParams();
  const id = params.id as string;
  const itemId = params.itemId as string;
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

  useEffect(() => {
    if (!user || !id) return;
    api<{ items: Array<{ id: string; name: string; url: string; price: number; image_url: string | null; target_amount: number | null }> }>(`/wishlists/${id}`)
      .then((w) => {
        const item = w.items?.find((i: { id: string }) => i.id === itemId);
        if (item) {
          setName(item.name);
          setUrl(item.url);
          setPrice(String(item.price));
          setImageUrl(item.image_url || "");
          setTargetAmount(item.target_amount ? String(item.target_amount) : "");
        }
      })
      .catch(() => router.push(`/wishlist/${id}`));
  }, [user, id, itemId, router]);

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
      setError(err instanceof Error ? err.message : "Не удалось загрузить информацию о товаре");
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api(`/wishlists/${id}/items/${itemId}`, {
        method: "PATCH",
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
      setError(err instanceof Error ? err.message : "Не удалось обновить");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <Link href={`/wishlist/${id}`} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium flex items-center gap-1 transition-colors w-fit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            Назад
          </Link>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-10 animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Изменить товар</h1>
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm animate-scale-in">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ссылка на товар</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 min-w-0 input-field"
                />
                <button
                  type="button"
                  onClick={handleFetchMeta}
                  disabled={fetching || !url.trim()}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  {fetching ? <span className="spinner border-slate-400/30 border-t-slate-500 w-4 h-4" /> : "Загрузить"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Название</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Цена (₽)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Целевая сумма (₽)</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                step="0.01"
                min="0"
                placeholder="Необязательно"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ссылка на изображение</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <span className="spinner border-white/30 border-t-white" /> : "Сохранить"}
          </button>
        </form>
      </main>
    </div>
  );
}
