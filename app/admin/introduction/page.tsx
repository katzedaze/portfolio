"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
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
import { toast } from "sonner";
import { Pencil, Trash2, Plus, GripVertical } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
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

function SortableIntroductionItem({
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
}

export default function IntroductionPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [introductions, setIntroductions] = useState<Introduction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntro, setEditingIntro] = useState<Introduction | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    displayOrder: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchIntroductions();
    }
  }, [session]);

  const fetchIntroductions = async () => {
    try {
      const response = await fetch("/api/introduction");
      if (response.ok) {
        const data = await response.json();
        setIntroductions(data);
      }
    } catch (error) {
      console.error("Failed to fetch introductions:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = introductions.findIndex((i) => i.id === active.id);
      const newIndex = introductions.findIndex((i) => i.id === over.id);

      const newIntroductions = arrayMove(introductions, oldIndex, newIndex);
      setIntroductions(newIntroductions);

      // Update displayOrder for all affected introductions
      try {
        const updatePromises = newIntroductions.map((intro, index) =>
          fetch(`/api/introduction/${intro.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: intro.title,
              content: intro.content,
              displayOrder: index,
            }),
          })
        );

        await Promise.all(updatePromises);
        toast.success("表示順序を更新しました");
      } catch (error) {
        console.error("Failed to update order:", error);
        toast.error("表示順序の更新に失敗しました");
        fetchIntroductions(); // Revert on error
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingIntro
        ? `/api/introduction/${editingIntro.id}`
        : "/api/introduction";
      const method = editingIntro ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          displayOrder: editingIntro
            ? formData.displayOrder
            : introductions.length,
        }),
      });

      if (response.ok) {
        toast.success(
          editingIntro ? "自己PRを更新しました" : "自己PRを追加しました"
        );
        setIsDialogOpen(false);
        resetForm();
        fetchIntroductions();
      } else {
        const errorData = await response.json();
        if (errorData.details) {
          toast.error(`入力エラー: ${errorData.details[0]?.message}`);
        } else {
          toast.error("保存に失敗しました");
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("保存に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (intro: Introduction) => {
    setEditingIntro(intro);
    setFormData({
      title: intro.title,
      content: intro.content,
      displayOrder: intro.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const response = await fetch(`/api/introduction/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("自己PRを削除しました");
        fetchIntroductions();
      } else {
        toast.error("削除に失敗しました");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("削除に失敗しました");
    }
  };

  const resetForm = () => {
    setEditingIntro(null);
    setFormData({
      title: "",
      content: "",
      displayOrder: 0,
    });
  };

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
