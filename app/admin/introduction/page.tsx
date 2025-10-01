"use client";

import { useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useCrudModal } from "@/hooks/use-crud-modal";
import { useSortableItems } from "@/hooks/use-sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, Plus, GripVertical } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Introduction {
  id: string;
  title: string;
  content: string;
  displayOrder: number;
}

const SortableIntroductionItem = memo(function SortableIntroductionItem({
  intro,
  onEdit,
  onDelete,
}: {
  intro: Introduction;
  onEdit: (intro: Introduction) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: intro.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none mt-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex-1 space-y-2">
        <h3 className="font-semibold text-lg">{intro.title}</h3>
        <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-3">
          <MarkdownRenderer content={intro.content} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(intro)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(intro.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

type IntroductionFormData = {
  title: string;
  content: string;
  displayOrder: number;
};

export default function IntroductionPage() {
  const router = useRouter();
  const { session, isPending } = useRequireAuth();

  const {
    items: introductions,
    setItems: setIntroductions,
    isLoading,
    isFetching,
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingIntro,
    formData,
    setFormData,
    fetchItems: fetchIntroductions,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
  } = useCrudModal<Introduction, IntroductionFormData>({
    apiPath: "/api/introduction",
    initialFormData: {
      title: "",
      content: "",
      displayOrder: 0,
    },
    mapItemToForm: (intro) => ({
      title: intro.title,
      content: intro.content,
      displayOrder: intro.displayOrder,
    }),
    mapFormToPayload: (formData, isEditing, items) => ({
      ...formData,
      displayOrder: isEditing ? formData.displayOrder : items.length,
    }),
    messages: {
      create: "自己PRを追加しました",
      update: "自己PRを更新しました",
      delete: "自己PRを削除しました",
      deleteConfirm: "本当に削除しますか？",
    },
  });

  useEffect(() => {
    if (session) {
      fetchIntroductions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const { sensors, handleDragEnd, closestCenter } = useSortableItems({
    items: introductions,
    setItems: setIntroductions,
    updateUrl: "/api/introduction/{id}",
    getUpdateData: (intro) => ({
      title: intro.title,
      content: intro.content,
    }),
    onError: fetchIntroductions,
  });

  if (isPending || isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">自己PR管理</h1>
          <div className="flex gap-4">
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新規追加
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingIntro ? "自己PR編集" : "自己PR追加"}
                  </DialogTitle>
                  <DialogDescription>
                    自己PR情報を入力してください
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">タイトル</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      placeholder="例: 技術への探求心と実装力"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">内容</Label>
                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="edit">編集</TabsTrigger>
                        <TabsTrigger value="preview">プレビュー</TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit">
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              content: e.target.value,
                            })
                          }
                          required
                          disabled={isLoading}
                          placeholder="# 見出し&#10;&#10;内容をMarkdown形式で入力してください。"
                          rows={15}
                          className="font-mono text-sm"
                        />
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="min-h-[360px] rounded-md border p-4">
                          {formData.content ? (
                            <MarkdownRenderer content={formData.content} />
                          ) : (
                            <p className="text-muted-foreground text-center py-8">
                              プレビューがここに表示されます
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "保存中..." : "保存"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                      disabled={isLoading}
                    >
                      キャンセル
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button onClick={() => router.push("/admin")} variant="outline">
              ダッシュボードに戻る
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>自己PR一覧</CardTitle>
            <CardDescription>ドラッグして並び替えができます</CardDescription>
          </CardHeader>
          <CardContent>
            {introductions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                自己PRが登録されていません
              </p>
            ) : (
              <div className="space-y-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={introductions.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {introductions.map((intro) => (
                      <SortableIntroductionItem
                        key={intro.id}
                        intro={intro}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
