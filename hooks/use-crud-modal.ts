"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api-client";

interface CrudItem {
  id: string;
  displayOrder: number;
}

interface UseCrudModalOptions<T extends CrudItem, F> {
  apiPath: string;
  initialFormData: F;
  mapItemToForm: (item: T) => F;
  mapFormToPayload: (
    formData: F,
    isEditing: boolean,
    items: T[]
  ) => Record<string, unknown>;
  messages: {
    create: string;
    update: string;
    delete: string;
    createError?: string;
    updateError?: string;
    deleteError?: string;
    deleteConfirm?: string;
  };
  onFetchSuccess?: (data: T[]) => void;
}

export function useCrudModal<T extends CrudItem, F>({
  apiPath,
  initialFormData,
  mapItemToForm,
  mapFormToPayload,
  messages,
  onFetchSuccess,
}: UseCrudModalOptions<T, F>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<F>(initialFormData);

  const fetchItems = async () => {
    try {
      const data = await apiClient.get<T[]>(apiPath);
      setItems(data);
      if (onFetchSuccess) {
        onFetchSuccess(data);
      }
    } catch (error) {
      console.error(`Failed to fetch from ${apiPath}:`, error);
      if (error instanceof ApiError) {
        toast.error(`データの取得に失敗しました: ${error.message}`);
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = mapFormToPayload(formData, !!editingItem, items);

      if (editingItem) {
        await apiClient.put(`${apiPath}/${editingItem.id}`, payload);
      } else {
        await apiClient.post(apiPath, payload);
      }

      toast.success(editingItem ? messages.update : messages.create);
      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Save error:", error);
      if (error instanceof ApiError && error.details) {
        const details = error.details as Array<{ message: string }>;
        toast.error(`入力エラー: ${details[0]?.message}`);
      } else if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(
          editingItem
            ? messages.updateError || "更新に失敗しました"
            : messages.createError || "保存に失敗しました"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setFormData(mapItemToForm(item));
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmMessage = messages.deleteConfirm || "本当に削除しますか？";
    if (!confirm(confirmMessage)) return;

    try {
      await apiClient.delete(`${apiPath}/${id}`);
      toast.success(messages.delete);
      fetchItems();
    } catch (error) {
      console.error("Delete error:", error);
      if (error instanceof ApiError) {
        toast.error(
          `${messages.deleteError || "削除に失敗しました"}: ${error.message}`
        );
      } else {
        toast.error(messages.deleteError || "削除に失敗しました");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData(initialFormData);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return {
    items,
    setItems,
    isLoading,
    isFetching,
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    formData,
    setFormData,
    fetchItems,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    openCreateDialog,
  };
}
