import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSortableItems } from "../use-sortable";
import type { DragEndEvent } from "@dnd-kit/core";

// Mock API client
vi.mock("@/lib/api-client", () => ({
  apiClient: {
    put: vi.fn(),
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

// Mock @dnd-kit/core
vi.mock("@dnd-kit/core", () => ({
  useSensor: vi.fn((sensor) => sensor),
  useSensors: vi.fn((...sensors) => sensors),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  closestCenter: vi.fn(),
}));

// Mock @dnd-kit/sortable
vi.mock("@dnd-kit/sortable", () => ({
  arrayMove: vi.fn((array, from, to) => {
    const newArray = [...array];
    const [movedItem] = newArray.splice(from, 1);
    newArray.splice(to, 0, movedItem);
    return newArray;
  }),
  sortableKeyboardCoordinates: vi.fn(),
}));

interface TestItem {
  id: string;
  name: string;
  displayOrder: number;
}

describe("useSortableItems", () => {
  const mockItems: TestItem[] = [
    { id: "1", name: "Item 1", displayOrder: 0 },
    { id: "2", name: "Item 2", displayOrder: 1 },
    { id: "3", name: "Item 3", displayOrder: 2 },
  ];

  let mockSetItems: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetItems = vi.fn();
  });

  it("should initialize with sensors", () => {
    const { result } = renderHook(() =>
      useSortableItems<TestItem>({
        items: mockItems,
        setItems: mockSetItems,
        updateUrl: "/api/test/{id}",
        getUpdateData: (item) => ({ name: item.name }),
      })
    );

    expect(result.current.sensors).toBeDefined();
    expect(result.current.handleDragEnd).toBeDefined();
    expect(result.current.closestCenter).toBeDefined();
  });

  it("should handle drag end and update order successfully", async () => {
    const { apiClient } = await import("@/lib/api-client");
    const { toast } = await import("sonner");

    vi.mocked(apiClient.put).mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useSortableItems<TestItem>({
        items: mockItems,
        setItems: mockSetItems,
        updateUrl: "/api/test/{id}",
        getUpdateData: (item) => ({ name: item.name }),
      })
    );

    const dragEvent: DragEndEvent = {
      active: { id: "1", data: { current: undefined } },
      over: { id: "3", data: { current: undefined }, disabled: false },
      delta: { x: 0, y: 0 },
      activatorEvent: {} as Event,
      collisions: null,
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    await waitFor(() => {
      expect(mockSetItems).toHaveBeenCalled();
      expect(apiClient.put).toHaveBeenCalledTimes(3);
      expect(toast.success).toHaveBeenCalledWith("表示順序を更新しました");
    });
  });

  it("should update displayOrder for all items after drag", async () => {
    const { apiClient } = await import("@/lib/api-client");

    vi.mocked(apiClient.put).mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useSortableItems<TestItem>({
        items: mockItems,
        setItems: mockSetItems,
        updateUrl: "/api/test/{id}",
        getUpdateData: (item) => ({ name: item.name }),
      })
    );

    const dragEvent: DragEndEvent = {
      active: { id: "1", data: { current: undefined } },
      over: { id: "2", data: { current: undefined }, disabled: false },
      delta: { x: 0, y: 0 },
      activatorEvent: {} as Event,
      collisions: null,
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    await waitFor(() => {
      const calls = vi.mocked(apiClient.put).mock.calls;
      expect(calls[0][1]).toHaveProperty("displayOrder", 0);
      expect(calls[1][1]).toHaveProperty("displayOrder", 1);
      expect(calls[2][1]).toHaveProperty("displayOrder", 2);
    });
  });

  it("should not update when active and over are the same", async () => {
    const { apiClient } = await import("@/lib/api-client");

    const { result } = renderHook(() =>
      useSortableItems<TestItem>({
        items: mockItems,
        setItems: mockSetItems,
        updateUrl: "/api/test/{id}",
        getUpdateData: (item) => ({ name: item.name }),
      })
    );

    const dragEvent: DragEndEvent = {
      active: { id: "1", data: { current: undefined } },
      over: { id: "1", data: { current: undefined }, disabled: false },
      delta: { x: 0, y: 0 },
      activatorEvent: {} as Event,
      collisions: null,
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    expect(mockSetItems).not.toHaveBeenCalled();
    expect(apiClient.put).not.toHaveBeenCalled();
  });

  it("should not update when over is null", async () => {
    const { apiClient } = await import("@/lib/api-client");

    const { result } = renderHook(() =>
      useSortableItems<TestItem>({
        items: mockItems,
        setItems: mockSetItems,
        updateUrl: "/api/test/{id}",
        getUpdateData: (item) => ({ name: item.name }),
      })
    );

    const dragEvent: DragEndEvent = {
      active: { id: "1", data: { current: undefined } },
      over: null,
      delta: { x: 0, y: 0 },
      activatorEvent: {} as Event,
      collisions: null,
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    expect(mockSetItems).not.toHaveBeenCalled();
    expect(apiClient.put).not.toHaveBeenCalled();
  });

  it("should handle ApiError and show error toast", async () => {
    const { apiClient, ApiError } = await import("@/lib/api-client");
    const { toast } = await import("sonner");

    vi.mocked(apiClient.put).mockRejectedValue(
      new ApiError(500, "Server error")
    );

    const { result } = renderHook(() =>
      useSortableItems<TestItem>({
        items: mockItems,
        setItems: mockSetItems,
        updateUrl: "/api/test/{id}",
        getUpdateData: (item) => ({ name: item.name }),
      })
    );

    const dragEvent: DragEndEvent = {
      active: { id: "1", data: { current: undefined } },
      over: { id: "2", data: { current: undefined }, disabled: false },
      delta: { x: 0, y: 0 },
      activatorEvent: {} as Event,
      collisions: null,
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "表示順序の更新に失敗しました: Server error"
      );
    });
  });

  it("should handle generic error and show error toast", async () => {
    const { apiClient } = await import("@/lib/api-client");
    const { toast } = await import("sonner");

    vi.mocked(apiClient.put).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() =>
      useSortableItems<TestItem>({
        items: mockItems,
        setItems: mockSetItems,
        updateUrl: "/api/test/{id}",
        getUpdateData: (item) => ({ name: item.name }),
      })
    );

    const dragEvent: DragEndEvent = {
      active: { id: "1", data: { current: undefined } },
      over: { id: "2", data: { current: undefined }, disabled: false },
      delta: { x: 0, y: 0 },
      activatorEvent: {} as Event,
      collisions: null,
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("表示順序の更新に失敗しました");
    });
  });

  it("should call onError callback when update fails", async () => {
    const { apiClient } = await import("@/lib/api-client");

    vi.mocked(apiClient.put).mockRejectedValue(new Error("Failed"));

    const onError = vi.fn();

    const { result } = renderHook(() =>
      useSortableItems<TestItem>({
        items: mockItems,
        setItems: mockSetItems,
        updateUrl: "/api/test/{id}",
        getUpdateData: (item) => ({ name: item.name }),
        onError,
      })
    );

    const dragEvent: DragEndEvent = {
      active: { id: "1", data: { current: undefined } },
      over: { id: "2", data: { current: undefined }, disabled: false },
      delta: { x: 0, y: 0 },
      activatorEvent: {} as Event,
      collisions: null,
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it("should replace {id} in updateUrl with item id", async () => {
    const { apiClient } = await import("@/lib/api-client");

    vi.mocked(apiClient.put).mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useSortableItems<TestItem>({
        items: mockItems,
        setItems: mockSetItems,
        updateUrl: "/api/test/{id}",
        getUpdateData: (item) => ({ name: item.name }),
      })
    );

    const dragEvent: DragEndEvent = {
      active: { id: "1", data: { current: undefined } },
      over: { id: "2", data: { current: undefined }, disabled: false },
      delta: { x: 0, y: 0 },
      activatorEvent: {} as Event,
      collisions: null,
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    await waitFor(() => {
      const calls = vi.mocked(apiClient.put).mock.calls;
      expect(calls[0][0]).toBe("/api/test/2");
      expect(calls[1][0]).toBe("/api/test/1");
      expect(calls[2][0]).toBe("/api/test/3");
    });
  });
});
