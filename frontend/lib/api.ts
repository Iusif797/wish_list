const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function getApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export function getWsUrl(path: string): string {
  const base = WS_URL.replace(/^http/, "ws");
  return `${base}${path}`;
}

export async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

const PROD_SPINUP_MS = 70000;

async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function api<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const url = getApiUrl(path);
  const isProd = typeof window !== "undefined" && !window.location.hostname.includes("localhost");
  const isOAuthExchange = path.includes("/auth/oauth/") && opts.body && JSON.parse(opts.body as string).code;
  const timeout = isProd ? PROD_SPINUP_MS : 30000;
  let lastErr: unknown;
  const maxAttempts = 2;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetchWithTimeout(url, { ...opts, headers }, timeout);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const detail = typeof err.detail === "string" ? err.detail : Array.isArray(err.detail) ? err.detail.map((x: { msg?: string }) => x.msg).join(", ") : res.statusText;
        const errMsg = detail || res.statusText;
        if (res.status >= 400 && res.status < 500) {
          throw new Error(errMsg);
        }
        throw new Error(errMsg);
      }
      return res.json();
    } catch (e) {
      lastErr = e;
      if (e instanceof Error && (e.message.includes("invalid_client") || e.message.includes("invalid_grant") || e.message.includes("OAuth") || e.message.includes("Unauthorized"))) {
        throw e;
      }
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, isOAuthExchange ? 1500 : isProd ? 3000 : 0));
        continue;
      }
      const msg = isProd
        ? "Сервер временно недоступен. Пожалуйста, попробуйте еще раз через минуту."
        : "Сервер недоступен. Убедитесь, что бэкенд запущен (uvicorn app.main:app --reload в папке backend).";
      throw new Error(msg);
    }
  }
  throw lastErr;
}

export function getAnonymousToken(): string {
  if (typeof window === "undefined") return "";
  let t = localStorage.getItem("anonymous_token");
  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem("anonymous_token", t);
  }
  return t;
}
