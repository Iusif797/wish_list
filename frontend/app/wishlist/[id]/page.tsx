"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";

interface WishlistItemOwner {
  id: string;
  name: string;
  url: string;
  price: number;
  image_url: string | null;
  target_amount: number | null;
  reserved: boolean;
  total_contributed: number;
  progress: number;
}

interface Wishlist {
  id: string;
  name: string;
  occasion: string;
  slug: string;
  items: WishlistItemOwner[];
}

function fetcher(path: string) {
  return api<Wishlist>(path);
}

export default function WishlistPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const { data: wishlist, error, isLoading, mutate } = useSWR(user && id ? `/wishlists/${id}` : null, fetcher);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  if (authLoading) return null;
  if (!wishlist && !isLoading && !error) return null;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/w/${wishlist?.slug}` : "";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 text-sm mb-6 inline-block">← Back</Link>
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">{error.message}</div>
        )}
        {isLoading && <div className="text-slate-500">Loading...</div>}
        {wishlist && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">{wishlist.name}</h1>
              <p className="text-slate-600 mt-1">{wishlist.occasion}</p>
              <div className="mt-4 p-4 bg-primary-50 rounded-xl">
                <p className="text-sm font-medium text-slate-700 mb-1">Share link</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                    className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Items</h2>
              <Link
                href={`/wishlist/${id}/add`}
                className="px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
              >
                Add item
              </Link>
            </div>
            {wishlist.items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-600 mb-6">No items yet. Add your first gift!</p>
                <Link
                  href={`/wishlist/${id}/add`}
                  className="inline-block px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
                >
                  Add first item
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlist.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6"
                  >
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-slate-100 overflow-hidden relative">
                      {item.image_url && (
                        <img src={item.image_url} alt="" className="w-full h-full object-cover absolute inset-0 z-10" onError={(e) => e.currentTarget.style.display = "none"} />
                      )}
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl">🎁</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{item.name}</h3>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline truncate block">
                        {item.url}
                      </a>
                      <p className="text-slate-600 mt-1">
                        {item.price} ₽
                        {item.target_amount && item.target_amount !== item.price && (
                          <span className="text-slate-500"> / target {item.target_amount} ₽</span>
                        )}
                      </p>
                      {item.target_amount && (
                        <div className="mt-2">
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
                      {item.reserved && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                          Reserved
                        </span>
                      )}
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2">
                      <Link
                        href={`/wishlist/${id}/edit/${item.id}`}
                        className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 text-center"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this item?")) return;
                          try {
                            await api(`/wishlists/${id}/items/${item.id}`, { method: "DELETE" });
                            mutate();
                          } catch {}
                        }}
                        className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg w-full"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
