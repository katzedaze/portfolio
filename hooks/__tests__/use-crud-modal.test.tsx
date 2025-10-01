import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCrudModal } from "../use-crud-modal";

// Mock API client
vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(
      public status: number,
      message: string,
      public details?: unknown
    ) {
      super(message);
    }
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

interface TestItem {
  id: string;
  name: string;
  displayOrder: number;
}

interface TestFormData {
  name: string;
  displayOrder: number;
}

describe("useCrudModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useCrudModal<TestItem, TestFormData>({
        apiPath: "/api/test",
        initialFormData: { name: "", displayOrder: 0 },
        mapItemToForm: (item) => ({ name: item.name, displayOrder: item.displayOrder }),
        mapFormToPayload: (data) => data,
        messages: {
          create: "Created",
          update: "Updated",
          delete: "Deleted",
        },
      })
    );

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.editingItem).toBeNull();
  });

  it("should fetch items successfully", async () => {
    const { apiClient } = await import("@/lib/api-client");
    const mockItems: TestItem[] = [
      { id: "1", name: "Item 1", displayOrder: 0 },
      { id: "2", name: "Item 2", displayOrder: 1 },
    ];

    vi.mocked(apiClient.get).mockResolvedValue(mockItems);

    const { result } = renderHook(() =>
      useCrudModal<TestItem, TestFormData>({
        apiPath: "/api/test",
        initialFormData: { name: "", displayOrder: 0 },
        mapItemToForm: (item) => ({ name: item.name, displayOrder: item.displayOrder }),
        mapFormToPayload: (data) => data,
        messages: {
          create: "Created",
          update: "Updated",
          delete: "Deleted",
        },
      })
    );

    await act(async () => {
      await result.current.fetchItems();
    });

    await waitFor(() => {
      expect(result.current.items).toEqual(mockItems);
      expect(result.current.isFetching).toBe(false);
    });
  });

  it("should create item successfully", async () => {
    const { apiClient } = await import("@/lib/api-client");
    const { toast } = await import("sonner");

    vi.mocked(apiClient.post).mockResolvedValue({ success: true });
    vi.mocked(apiClient.get).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useCrudModal<TestItem, TestFormData>({
        apiPath: "/api/test",
        initialFormData: { name: "", displayOrder: 0 },
        mapItemToForm: (item) => ({ name: item.name, displayOrder: item.displayOrder }),
        mapFormToPayload: (data) => data,
        messages: {
          create: "Created",
          update: "Updated",
          delete: "Deleted",
        },
      })
    );

    act(() => {
      result.current.setFormData({ name: "New Item", displayOrder: 0 });
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any);
    });

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/api/test", {
        name: "New Item",
        displayOrder: 0,
      });
      expect(toast.success).toHaveBeenCalledWith("Created");
      expect(result.current.isDialogOpen).toBe(false);
    });
  });

  it("should update item successfully", async () => {
    const { apiClient } = await import("@/lib/api-client");
    const { toast } = await import("sonner");

    const mockItem: TestItem = { id: "1", name: "Item 1", displayOrder: 0 };

    vi.mocked(apiClient.put).mockResolvedValue({ success: true });
    vi.mocked(apiClient.get).mockResolvedValue([mockItem]);

    const { result } = renderHook(() =>
      useCrudModal<TestItem, TestFormData>({
        apiPath: "/api/test",
        initialFormData: { name: "", displayOrder: 0 },
        mapItemToForm: (item) => ({ name: item.name, displayOrder: item.displayOrder }),
        mapFormToPayload: (data) => data,
        messages: {
          create: "Created",
          update: "Updated",
          delete: "Deleted",
        },
      })
    );

    act(() => {
      result.current.handleEdit(mockItem);
      result.current.setFormData({ name: "Updated Item", displayOrder: 0 });
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any);
    });

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith("/api/test/1", {
        name: "Updated Item",
        displayOrder: 0,
      });
      expect(toast.success).toHaveBeenCalledWith("Updated");
    });
  });

  it("should delete item successfully", async () => {
    const { apiClient } = await import("@/lib/api-client");
    const { toast } = await import("sonner");

    vi.mocked(apiClient.delete).mockResolvedValue(undefined);
    vi.mocked(apiClient.get).mockResolvedValue([]);

    // Mock window.confirm
    global.confirm = vi.fn(() => true);

    const { result } = renderHook(() =>
      useCrudModal<TestItem, TestFormData>({
        apiPath: "/api/test",
        initialFormData: { name: "", displayOrder: 0 },
        mapItemToForm: (item) => ({ name: item.name, displayOrder: item.displayOrder }),
        mapFormToPayload: (data) => data,
        messages: {
          create: "Created",
          update: "Updated",
          delete: "Deleted",
        },
      })
    );

    await act(async () => {
      await result.current.handleDelete("1");
    });

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith("/api/test/1");
      expect(toast.success).toHaveBeenCalledWith("Deleted");
    });
  });

  it("should not delete item when user cancels confirmation", async () => {
    const { apiClient } = await import("@/lib/api-client");

    // Mock window.confirm to return false
    global.confirm = vi.fn(() => false);

    const { result } = renderHook(() =>
      useCrudModal<TestItem, TestFormData>({
        apiPath: "/api/test",
        initialFormData: { name: "", displayOrder: 0 },
        mapItemToForm: (item) => ({ name: item.name, displayOrder: item.displayOrder }),
        mapFormToPayload: (data) => data,
        messages: {
          create: "Created",
          update: "Updated",
          delete: "Deleted",
        },
      })
    );

    await act(async () => {
      await result.current.handleDelete("1");
    });

    expect(apiClient.delete).not.toHaveBeenCalled();
  });
});
