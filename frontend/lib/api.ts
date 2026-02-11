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
  let res: Response;
  try {
    res = await fetch(getApiUrl(path), { ...opts, headers });
  } catch (e) {
    throw new Error(
      "Сервер недоступен. Убедитесь, что бэкенд запущен (uvicorn app.main:app --reload в папке backend)."
    );
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = typeof err.detail === "string" ? err.detail : Array.isArray(err.detail) ? err.detail.map((x: { msg?: string }) => x.msg).join(", ") : res.statusText;
    throw new Error(detail || res.statusText);
  }
  return res.json();
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
