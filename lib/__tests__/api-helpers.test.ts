import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  requireAuth,
  validateRequest,
  withErrorHandling,
  withAuth,
} from "../api-helpers";

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return session when authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    const mockSession = {
      user: {
        id: "123",
        email: "test@example.com",
        emailVerified: false,
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session-123",
        userId: "123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

    const request = new NextRequest("http://localhost:3000/api/test");
    const session = await requireAuth(request);

    expect(session).toEqual(mockSession);
  });

  it("should throw error when not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/test");

    await expect(requireAuth(request)).rejects.toThrow("Unauthorized");
  });
});

describe("validateRequest", () => {
  it("should validate and return parsed data", async () => {
    const mockSchema = {
      parse: vi.fn((data) => data),
    };

    const requestBody = { name: "Test", value: 123 };
    const request = new NextRequest("http://localhost:3000/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await validateRequest(request, mockSchema as any);

    expect(result).toEqual(requestBody);
    expect(mockSchema.parse).toHaveBeenCalledWith(requestBody);
  });

  it("should throw validation error for invalid data", async () => {
    const { ZodError } = await import("zod");
    const mockSchema = {
      parse: vi.fn(() => {
        throw new ZodError([
          {
            code: "invalid_type",
            expected: "string",
            path: ["name"],
            message: "Expected string, received number",
          },
        ]);
      }),
    };

    const requestBody = { name: 123 };
    const request = new NextRequest("http://localhost:3000/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validateRequest(request, mockSchema as any)
    ).rejects.toBeInstanceOf(ZodError);
  });
});

describe("withErrorHandling", () => {
  it("should handle successful handler execution", async () => {
    const mockHandler = vi.fn().mockResolvedValue({ data: "success" });
    const wrappedHandler = withErrorHandling(mockHandler, "Test Handler");

    const response = await wrappedHandler();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ data: "success" });
  });

  it("should handle ZodError with 400 status", async () => {
    const { ZodError } = await import("zod");
    const mockHandler = vi.fn().mockRejectedValue(
      new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          path: ["field"],
          message: "Invalid type",
        },
      ])
    );

    const wrappedHandler = withErrorHandling(mockHandler, "Test Handler");
    const response = await wrappedHandler();
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
    expect(data.details).toBeDefined();
  });

  it("should handle generic errors with 500 status", async () => {
    const mockHandler = vi.fn().mockRejectedValue(new Error("Database error"));
    const wrappedHandler = withErrorHandling(mockHandler, "Test Handler");

    const response = await wrappedHandler();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
  });
});

describe("withAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute handler when authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    const mockSession = {
      user: {
        id: "123",
        email: "test@example.com",
        emailVerified: false,
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session-123",
        userId: "123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

    const mockHandler = vi.fn().mockResolvedValue({ success: true });
    const wrappedHandler = withAuth(mockHandler, "Test Handler");

    const request = new NextRequest("http://localhost:3000/api/test");
    const response = await wrappedHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(mockHandler).toHaveBeenCalledWith(request);
  });

  it("should return 401 when not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const mockHandler = vi.fn();
    const wrappedHandler = withAuth(mockHandler, "Test Handler");

    const request = new NextRequest("http://localhost:3000/api/test");
    const response = await wrappedHandler(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("should handle errors from handler", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: {
        id: "123",
        email: "test@example.com",
        emailVerified: false,
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session-123",
        userId: "123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const mockHandler = vi.fn().mockRejectedValue(new Error("Handler error"));
    const wrappedHandler = withAuth(mockHandler, "Test Handler");

    const request = new NextRequest("http://localhost:3000/api/test");
    const response = await wrappedHandler(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
  });
});
