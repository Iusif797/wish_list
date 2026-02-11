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
  if (!res.ok) throw new Error("Not found");
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900">Wishlist</Link>
          <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">Sign in</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="p-6 bg-red-50 text-red-700 rounded-xl">Wishlist not found.</div>
        )}
        {isLoading && <div className="text-slate-500 py-12">Loading...</div>}
        {wishlist && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">{wishlist.name}</h1>
              <p className="text-slate-600 mt-1">{wishlist.occasion}</p>
            </div>
            {wishlist.items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-600">No items in this wishlist yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {wishlist.items.map((item) => (
                  <PublicItemCard
                    key={item.id}
                    item={item}
                    slug={slug}
                    anonToken={anonToken}
                    onUpdate={mutate}
                  />
                ))}
              </div>
            )}
          </>
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
}: {
  item: WishlistItemPublic;
  slug: string;
  anonToken: string;
  onUpdate: () => void;
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
      if (!res.ok) throw new Error();
      onUpdate();
    } catch {
      setError("Failed");
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
      if (!res.ok) throw new Error();
      onUpdate();
    } catch {
      setError("Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleContribute(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(contribAmount);
    if (!amount || amount <= 0) return;
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
      if (!res.ok) throw new Error();
      setContribAmount("");
      onUpdate();
    } catch {
      setError("Failed");
    } finally {
      setLoading(false);
    }
  }

  const canReserve = !item.reserved && !item.reserved_by_me;
  const canUnreserve = item.reserved_by_me;
  const hasTarget = item.target_amount != null && item.target_amount > 0;
  const canContribute = hasTarget && item.progress < 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-slate-100 overflow-hidden relative">
          {item.image_url && (
            <img
              src={item.image_url}
              alt=""
              className="w-full h-full object-cover absolute inset-0 z-10"
              onError={(e) => e.currentTarget.style.display = "none"}
            />
          )}
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl">
            🎁
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900">{item.name}</h3>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline truncate block">
            {item.url}
          </a>
          <p className="text-slate-600 mt-1">{item.price} ₽</p>
          {hasTarget && (
            <div className="mt-3">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition"
                  style={{ width: `${Math.min(item.progress * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {item.total_contributed} / {item.target_amount} ₽
              </p>
            </div>
          )}
          {item.reserved && !item.reserved_by_me && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">Reserved</span>
          )}
          {item.reserved_by_me && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-primary-100 text-primary-800 text-xs rounded">You reserved</span>
          )}
        </div>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        {canReserve && (
          <button
            onClick={handleReserve}
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 text-sm"
          >
            Reserve this gift
          </button>
        )}
        {canUnreserve && (
          <button
            onClick={handleUnreserve}
            disabled={loading}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 text-sm"
          >
            Cancel reservation
          </button>
        )}
        {canContribute && (
          <form onSubmit={handleContribute} className="flex gap-2 items-center">
            <input
              type="number"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
              placeholder="Amount (₽)"
              step="0.01"
              min="0"
              className="w-28 px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 disabled:opacity-50 text-sm"
            >
              Contribute
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
