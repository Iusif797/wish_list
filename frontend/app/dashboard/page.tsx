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
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My wishlists</h1>
          <Link
            href="/dashboard/new"
            className="px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
          >
            New wishlist
          </Link>
        </div>
        {isLoading && (
          <div className="text-slate-500">Loading...</div>
        )}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error.message}
          </div>
        )}
        {wishlists && wishlists.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-600 mb-6">You don&apos;t have any wishlists yet.</p>
            <Link
              href="/dashboard/new"
              className="inline-block px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
            >
              Create your first wishlist
            </Link>
          </div>
        )}
        {wishlists && wishlists.length > 0 && (
          <div className="space-y-4">
            {wishlists.map((w) => (
              <Link
                key={w.id}
                href={`/wishlist/${w.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-6 hover:border-primary-300 hover:shadow-md transition"
              >
                <h2 className="font-semibold text-slate-900">{w.name}</h2>
                <p className="text-sm text-slate-500 mt-1">{w.occasion}</p>
                <p className="text-xs text-primary-600 mt-2">/w/{w.slug}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
