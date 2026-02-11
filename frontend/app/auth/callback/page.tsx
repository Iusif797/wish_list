"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("No code from Google");
      setLoading(false);
      return;
    }
    api<{ access_token: string; user: { id: string; email: string; name: string | null } }>("/auth/oauth/google", {
      method: "POST",
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        localStorage.setItem("token", res.access_token);
        router.push("/dashboard");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "OAuth failed");
      })
      .finally(() => setLoading(false));
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Signing in...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <a href="/login" className="text-primary-500 dark:text-primary-400 hover:underline">Back to login</a>
      </div>
    );
  }

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Signing in...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
