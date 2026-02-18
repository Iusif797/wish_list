import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ user: { id: "1" }, loading: false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("swr", () => ({
  default: () => ({
    data: [
      { id: "1", name: "Birthday", occasion: "2025", slug: "abc", item_count: 3 },
      { id: "2", name: "Wedding", occasion: "2026", slug: "xyz", item_count: 1 },
    ],
    error: null,
    isLoading: false,
  }),
}));

describe("DashboardPage", () => {
  it("renders wishlist cards with item count", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Birthday")).toBeInTheDocument();
    expect(screen.getByText("Wedding")).toBeInTheDocument();
    expect(screen.getByText("3 items")).toBeInTheDocument();
    expect(screen.getByText("1 item")).toBeInTheDocument();
  });
});
