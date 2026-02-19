"use client";

import { useOAuthUrl } from "@/lib/oauth";

export function OAuthPrefetcher() {
  useOAuthUrl();
  return null;
}
