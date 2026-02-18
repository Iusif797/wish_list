import { describe, it, expect, vi, beforeEach } from "vitest";

describe("api", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  it("adds Authorization header when token exists", async () => {
    vi.mocked(localStorage.getItem).mockReturnValue("test-token");
    const { api } = await import("@/lib/api");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    await api("/test");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });
});
