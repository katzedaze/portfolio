import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock better-auth client
vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(),
}));

import { useRequireAuth } from "../use-require-auth";
import { useSession } from "@/lib/auth-client";

describe("useRequireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to login when session is null and not pending", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      isPending: false,
      error: null,
    });

    renderHook(() => useRequireAuth());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/login");
    });
  });

  it("should not redirect when session exists", () => {
    const mockSession = { user: { id: "123", email: "test@example.com" } };

    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null,
    });

    const { result } = renderHook(() => useRequireAuth());

    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isPending).toBe(false);
  });

  it("should not redirect when session is still loading", () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      isPending: true,
      error: null,
    });

    const { result } = renderHook(() => useRequireAuth());

    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(true);
  });

  it("should return session and isPending values correctly", () => {
    const mockSession = { user: { id: "456", email: "user@test.com" } };

    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null,
    });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isPending).toBe(false);
  });
});
