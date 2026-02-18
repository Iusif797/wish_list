"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface WishlistItem {
  id: string;
  name: string;
  occasion: string;
  slug: string;
  item_count: number;
}

function fetcher(path: string) {
  return api<WishlistItem[]>(path);
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data: wishlists, error, isLoading } = useSWR(user ? "/wishlists/my" : null, fetcher);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">My wishlists</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage and share your wishlists</p>
          </div>
          <Link
            href="/dashboard/new"
            className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-emerald-600 transition-all shadow-glow hover:shadow-glow-lg flex items-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            New wishlist
          </Link>
        </div>
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <span className="spinner border-primary-500/30 border-t-primary-500 w-8 h-8" />
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-xl animate-scale-in">
            {error.message}
          </div>
        )}
        {wishlists && wishlists.length === 0 && (
          <div className="glass-card rounded-3xl p-8 sm:p-16 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">You don&apos;t have any wishlists yet.</p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-emerald-600 transition-all shadow-glow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Create your first wishlist
            </Link>
          </div>
        )}
        {wishlists && wishlists.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {wishlists.map((w, i) => (
              <Link
                key={w.id}
                href={`/wishlist/${w.id}`}
                className="glass-card rounded-2xl p-6 hover-lift group animate-slide-up"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-primary-950/30 dark:to-emerald-950/30 flex items-center justify-center mb-3 group-hover:from-primary-100 group-hover:to-emerald-100 dark:group-hover:from-primary-900/30 dark:group-hover:to-emerald-900/30 transition-colors">
                    <span className="text-lg">🎁</span>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg">{w.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{w.occasion}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{w.item_count} {w.item_count === 1 ? "item" : "items"}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-lg">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                  /w/{w.slug}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
