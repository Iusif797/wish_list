"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { api, getApiUrl, getWsUrl, getAnonymousToken } from "@/lib/api";

interface WishlistItemPublic {
  id: string;
  name: string;
  url: string;
  price: number;
  image_url: string | null;
  target_amount: number | null;
  reserved: boolean;
  reserved_by_me: boolean;
  total_contributed: number;
  contributed_by_me: number;
  progress: number;
}

interface WishlistPublic {
  id: string;
  name: string;
  occasion: string;
  slug: string;
  items: WishlistItemPublic[];
}

async function fetchPublicWishlist(slug: string, anonToken: string): Promise<WishlistPublic> {
  const url = getApiUrl(`/wishlists/public/${slug}`);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const params = new URLSearchParams();
  if (anonToken) params.set("anonymous_token", anonToken);
  const q = params.toString();
  const res = await fetch(`${url}${q ? `?${q}` : ""}`, { headers });
  if (!res.ok) throw new Error("Список не найден");
  return res.json();
}

export default function PublicWishlistPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [anonToken] = useState(() => getAnonymousToken());
  const { data: wishlist, error, isLoading, mutate } = useSWR(
    slug ? [`public-wishlist`, slug, anonToken] : null,
    () => fetchPublicWishlist(slug, anonToken),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (!slug) return;
    const wsUrl = getWsUrl(`/ws/wishlist/${slug}`);
    const url = wsUrl.startsWith("http") ? wsUrl.replace(/^http/, "ws") : wsUrl;
    const ws = new WebSocket(url);
    ws.onmessage = () => mutate();
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [slug, mutate]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="Wishlist" className="w-8 h-8 rounded-xl shadow-glow" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">Wishlist</span>
          </Link>
          <Link href="/login" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-4 py-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all">
            Войти
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {error && (
          <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-2xl animate-scale-in">Список не найден или доступ ограничен.</div>
        )}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <span className="spinner border-primary-500/30 border-t-primary-500 w-8 h-8" />
          </div>
        )}
        {wishlist && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{wishlist.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{wishlist.occasion}</p>
            </div>
            {wishlist.items.length === 0 ? (
              <div className="glass-card rounded-3xl p-8 sm:p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎁</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-lg">В этом списке пока нет товаров.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {wishlist.items.map((item, i) => (
                  <PublicItemCard
                    key={item.id}
                    item={item}
                    slug={slug}
                    anonToken={anonToken}
                    onUpdate={mutate}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function PublicItemCard({
  item,
  slug,
  anonToken,
  onUpdate,
  index,
}: {
  item: WishlistItemPublic;
  slug: string;
  anonToken: string;
  onUpdate: () => void;
  index: number;
}) {
  const [contribAmount, setContribAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReserve() {
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const body = token ? {} : { anonymous_token: anonToken };
      const res = await fetch(getApiUrl(`/wishlists/public/${slug}/items/${item.id}/reserve`), {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.detail === "string" ? data.detail : "Не удалось забронировать подарок");
      }
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось забронировать подарок");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnreserve() {
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const body = token ? {} : { anonymous_token: anonToken };
      const res = await fetch(getApiUrl(`/wishlists/public/${slug}/items/${item.id}/reserve`), {
        method: "DELETE",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.detail === "string" ? data.detail : "Не удалось отменить бронь");
      }
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отменить бронь");
    } finally {
      setLoading(false);
    }
  }

  const targetAmount = item.target_amount ?? item.price;
  const maxContribution = targetAmount - item.total_contributed;

  async function handleContribute(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(contribAmount);
    if (!amount || amount <= 0) return;
    if (amount > maxContribution) {
      setError("Сумма превышает остаток для сбора");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const body = token ? { amount } : { amount, anonymous_token: anonToken };
      const res = await fetch(getApiUrl(`/wishlists/public/${slug}/items/${item.id}/contribute`), {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.detail === "string" ? data.detail : "Ошибка при переводе");
      }
      setContribAmount("");
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  const canReserve = !item.reserved && !item.reserved_by_me;
  const canUnreserve = item.reserved_by_me;
  const hasTarget = item.target_amount != null && item.target_amount > 0;
  const canContribute = hasTarget && item.progress < 1 && !item.reserved;

  return (
    <div
      className="glass-card rounded-2xl p-5 sm:p-6 animate-slide-up hover-lift"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 overflow-hidden relative">
          {item.image_url && (
            <img
              src={item.image_url}
              alt=""
              className="w-full h-full object-cover absolute inset-0 z-10"
              onError={(e) => e.currentTarget.style.display = "none"}
            />
          )}
          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-3xl">
            🎁
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline truncate block mt-0.5">
            {item.url}
          </a>
          <p className="text-slate-600 dark:text-slate-400 mt-1.5 font-semibold">{item.price} ₽</p>
          {hasTarget && (
            <div className="mt-3">
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(item.progress * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                {item.total_contributed} / {item.target_amount} ₽
              </p>
            </div>
          )}
          {item.reserved && !item.reserved_by_me && (
            <span className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              Забронировано
            </span>
          )}
          {item.reserved_by_me && (
            <span className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-lg">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              Вы забронировали
            </span>
          )}
        </div>
      </div>
      {error && <p className="text-red-600 dark:text-red-400 text-sm mt-3 font-medium animate-scale-in">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        {canReserve && (
          <button
            onClick={handleReserve}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-emerald-600 disabled:opacity-50 text-sm shadow-glow transition-all flex items-center gap-1.5"
          >
            {loading ? <span className="spinner border-white/30 border-t-white w-4 h-4" /> : "Забронировать подарок"}
          </button>
        )}
        {canUnreserve && (
          <button
            onClick={handleUnreserve}
            disabled={loading}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-50 text-sm transition-colors flex items-center gap-1.5"
          >
            {loading ? <span className="spinner border-slate-400/30 border-t-slate-500 w-4 h-4" /> : "Отменить бронь"}
          </button>
        )}
        {canContribute && (
          <form onSubmit={handleContribute} className="flex flex-wrap gap-2 items-center">
            <input
              type="number"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
              placeholder="Сумма (₽)"
              step="0.01"
              min="0"
              max={maxContribution}
              className="w-full sm:w-28 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white/80 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 disabled:opacity-50 text-sm transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              {loading ? <span className="spinner border-white/30 border-t-white w-4 h-4" /> : "Скинуться"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
