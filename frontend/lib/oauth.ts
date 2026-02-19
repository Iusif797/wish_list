"use client";

import useSWR from "swr";
import { getApiUrl } from "./api";

const OAUTH_CACHE_KEY = "oauth_google_url";
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCachedUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem(OAUTH_CACHE_KEY);
    if (!cached) return null;
    const { url, ts } = JSON.parse(cached);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return url;
  } catch {
    return null;
  }
}

function setCachedUrl(url: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (url) {
      sessionStorage.setItem(OAUTH_CACHE_KEY, JSON.stringify({ url, ts: Date.now() }));
    } else {
      sessionStorage.removeItem(OAUTH_CACHE_KEY);
    }
  } catch {}
}

async function fetcher(): Promise<string | null> {
  const cached = getCachedUrl();
  if (cached) return cached;
  try {
    const res = await fetch(getApiUrl("/auth/oauth/google"));
    if (!res.ok) return null;
    const data = await res.json();
    const url = data?.url || null;
    setCachedUrl(url);
    return url;
  } catch {
    return null;
  }
}

export function useOAuthUrl() {
  const { data: oauthUrl, isLoading } = useSWR<string | null>("oauth-google-url", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000,
    fallbackData: typeof window !== "undefined" ? getCachedUrl() : undefined,
  });
  return { oauthUrl: oauthUrl ?? null, loading: isLoading };
}
