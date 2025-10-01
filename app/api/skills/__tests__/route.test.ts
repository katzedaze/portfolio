import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";
import { NextRequest } from "next/server";

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock schema
vi.mock("@/lib/db/schema", () => ({
  skill: {
    displayOrder: "displayOrder",
    name: "name",
  },
}));

// Mock validations
vi.mock("@/lib/validations", () => ({
  skillSchema: {
    parse: vi.fn((data) => data),
  },
}));

describe("Skills API - GET /api/skills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return all skills with formatted experience years", async () => {
    const { db } = await import("@/lib/db");
    const mockSkills = [
      {
        id: "1",
        name: "TypeScript",
        category: "frontend",
        proficiency: "Advanced",
        yearsOfExperience: 35, // 3.5 * 10
        displayOrder: 0,
      },
      {
        id: "2",
        name: "React",
        category: "frontend",
        proficiency: "Expert",
        yearsOfExperience: 50, // 5.0 * 10
        displayOrder: 1,
      },
    ];

    vi.mocked(db.orderBy).mockResolvedValue(mockSkills);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        ...mockSkills[0],
        yearsOfExperience: 3.5,
      },
      {
        ...mockSkills[1],
        yearsOfExperience: 5.0,
      },
    ]);
  });

  it("should handle database errors gracefully", async () => {
    const { db } = await import("@/lib/db");
    vi.mocked(db.orderBy).mockRejectedValue(new Error("Database error"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
  });
});

describe("Skills API - POST /api/skills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new skill when authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    const { db } = await import("@/lib/db");

    // Mock authenticated session
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-123", email: "admin@example.com" },
      session: { id: "session-123", userId: "user-123" },
    });

    const requestBody = {
      name: "Next.js",
      category: "frontend",
      proficiency: "Advanced",
      yearsOfExperience: 2.5,
      displayOrder: 0,
    };

    const request = new NextRequest("http://localhost:3000/api/skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(db.insert).toHaveBeenCalled();
    expect(db.values).toHaveBeenCalledWith({
      name: "Next.js",
      category: "frontend",
      proficiency: "Advanced",
      yearsOfExperience: 25, // 2.5 * 10
      displayOrder: 0,
    });
  });

  it("should return 401 when not authenticated", async () => {
    const { auth } = await import("@/lib/auth");

    // Mock unauthenticated session
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const requestBody = {
      name: "Vue.js",
      category: "frontend",
      proficiency: "Intermediate",
      yearsOfExperience: 1.5,
      displayOrder: 0,
    };

    const request = new NextRequest("http://localhost:3000/api/skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should validate request data and return 400 on validation error", async () => {
    const { auth } = await import("@/lib/auth");
    const { skillSchema } = await import("@/lib/validations");

    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-123", email: "admin@example.com" },
      session: { id: "session-123", userId: "user-123" },
    });

    // Mock validation error
    const { ZodError } = await import("zod");
    vi.mocked(skillSchema.parse).mockImplementation(() => {
      throw new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["name"],
          message: "Required",
        },
      ]);
    });

    const requestBody = {
      category: "frontend",
      proficiency: "Advanced",
      yearsOfExperience: 2.5,
    };

    const request = new NextRequest("http://localhost:3000/api/skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
    expect(data.details).toBeDefined();
  });
});
