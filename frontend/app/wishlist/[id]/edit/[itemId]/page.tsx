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
    } catch {
      setError("Could not fetch product info");
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
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href={`/wishlist/${id}`} className="text-slate-600 hover:text-slate-900 text-sm">← Back</Link>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit item</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleFetchMeta}
                  disabled={fetching || !url.trim()}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50"
                >
                  {fetching ? "..." : "Fetch"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (₽)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target amount (₽)</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                step="0.01"
                min="0"
                placeholder="Optional"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </main>
    </div>
  );
}
