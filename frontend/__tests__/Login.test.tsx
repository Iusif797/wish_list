import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ login: vi.fn(), user: null, loading: false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockApi = vi.fn();
vi.mock("@/lib/api", () => ({
  getApiUrl: (path: string) => `http://test${path}`,
  api: (...args: unknown[]) => mockApi(...args),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mockApi.mockReset();
  });

  it("renders sign in form", () => {
    mockApi.mockRejectedValue(new Error("unavailable"));
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /Вход в аккаунт/i })).toBeInTheDocument();
    expect(screen.getByText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Пароль/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Войти/i })).toBeInTheDocument();
  });

  it("renders Sign in with Google when oauth URL is available", async () => {
    mockApi.mockResolvedValue({ url: "https://accounts.google.com/..." });
    render(<LoginPage />);
    await vi.waitFor(() => {
      expect(screen.getByText(/Войти через Google/i)).toBeInTheDocument();
    });
  });
});
