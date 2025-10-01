"use client";

import {
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api-client";

interface SortableItem {
  id: string;
  displayOrder: number;
}

interface UseSortableOptions<T extends SortableItem> {
  items: T[];
  setItems: (items: T[]) => void;
  updateUrl: string;
  getUpdateData: (item: T) => Record<string, unknown>;
  onError?: () => void;
}

/**
 * ドラッグ&ドロップによる並び替え機能を提供するカスタムフック
 * @param options - ソート可能なアイテムの設定
 * @returns センサーとドラッグ終了ハンドラー
 */
export function useSortableItems<T extends SortableItem>({
  items,
  setItems,
  updateUrl,
  getUpdateData,
  onError,
}: UseSortableOptions<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update displayOrder for all affected items
      try {
        const updatePromises = newItems.map((item, index) =>
          apiClient.put(updateUrl.replace("{id}", item.id), {
            ...getUpdateData(item),
            displayOrder: index,
          })
        );

        await Promise.all(updatePromises);
        toast.success("表示順序を更新しました");
      } catch (error) {
        console.error("Failed to update order:", error);
        if (error instanceof ApiError) {
          toast.error(`表示順序の更新に失敗しました: ${error.message}`);
        } else {
          toast.error("表示順序の更新に失敗しました");
        }
        if (onError) {
          onError(); // Revert on error
        }
      }
    }
  };

  return {
    sensors,
    handleDragEnd,
    closestCenter,
  };
}
