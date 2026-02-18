"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { ConfirmModal } from "@/components/ConfirmModal";
import { api, getWsUrl } from "@/lib/api";

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
  const [copied, setCopied] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [modalWishlist, setModalWishlist] = useState(false);
  const [modalItem, setModalItem] = useState<WishlistItemOwner | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!wishlist?.slug) return;
    const wsUrl = getWsUrl(`/ws/wishlist/${wishlist.slug}`);
    const url = wsUrl.startsWith("http") ? wsUrl.replace(/^http/, "ws") : wsUrl;
    const ws = new WebSocket(url);
    ws.onmessage = () => mutate();
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [wishlist?.slug, mutate]);

  if (authLoading) return null;
  if (!wishlist && !isLoading && !error) return null;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/w/${wishlist?.slug}` : "";

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            Back
          </Link>
          {wishlist && (
            <button
              onClick={() => setModalWishlist(true)}
              className="text-red-500 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              Delete wishlist
            </button>
          )}
        </div>
        {(error || deleteError) && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-xl mb-6 animate-scale-in">{error?.message ?? deleteError}</div>
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
              <div className="mt-5 p-4 bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-950/20 dark:to-emerald-950/20 rounded-2xl border border-primary-100/50 dark:border-primary-800/30">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Share link</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-primary-200/50 dark:border-primary-700/30 bg-white dark:bg-slate-800 text-sm font-mono truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:from-primary-600 hover:to-emerald-600 transition-all shadow-glow shrink-0"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Items</h2>
              <Link
                href={`/wishlist/${id}/add`}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-emerald-600 transition-all shadow-glow flex items-center gap-1.5 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add item
              </Link>
            </div>
            {wishlist.items.length === 0 ? (
              <div className="glass-card rounded-3xl p-8 sm:p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎁</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">No items yet. Add your first gift!</p>
                <Link
                  href={`/wishlist/${id}/add`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-emerald-600 transition-all shadow-glow"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Add first item
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlist.items.map((item, i) => (
                  <div
                    key={item.id}
                    className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 animate-slide-up hover-lift"
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                  >
                    <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 overflow-hidden relative">
                      {item.image_url && (
                        <img src={item.image_url} alt="" className="w-full h-full object-cover absolute inset-0 z-10" onError={(e) => e.currentTarget.style.display = "none"} />
                      )}
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-3xl">🎁</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline truncate block mt-0.5">
                        {item.url}
                      </a>
                      <p className="text-slate-600 dark:text-slate-400 mt-1.5 font-semibold">
                        {item.price} ₽
                        {item.target_amount && item.target_amount !== item.price && (
                          <span className="text-slate-400 dark:text-slate-500 font-normal"> / target {item.target_amount} ₽</span>
                        )}
                      </p>
                      {item.target_amount && (
                        <div className="mt-3">
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
                      {item.reserved && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                          Reserved
                        </span>
                      )}
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2">
                      <Link
                        href={`/wishlist/${id}/edit/${item.id}`}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-center transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteError("");
                          setModalItem(item);
                        }}
                        className="px-4 py-2 text-red-500 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl w-full transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <ConfirmModal
        open={modalWishlist}
        title="Delete wishlist"
        message="Delete this entire wishlist? All items, reservations and contributions will be removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          setModalWishlist(false);
          setDeleteError("");
          try {
            await api(`/wishlists/${id}`, { method: "DELETE" });
            router.push("/dashboard");
          } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "Failed to delete wishlist");
          }
        }}
        onCancel={() => setModalWishlist(false)}
      />
      <ConfirmModal
        open={!!modalItem}
        title="Delete item"
        message={
          modalItem
            ? modalItem.total_contributed > 0 || modalItem.reserved
              ? "This item has contributions or a reservation. Deleting will remove them. Continue?"
              : "Delete this item?"
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (!modalItem) return;
          const itemId = modalItem.id;
          setModalItem(null);
          setDeleteError("");
          try {
            await api(`/wishlists/${id}/items/${itemId}`, { method: "DELETE" });
            mutate();
          } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "Failed to delete item");
          }
        }}
        onCancel={() => setModalItem(null)}
      />
    </div>
  );
}
