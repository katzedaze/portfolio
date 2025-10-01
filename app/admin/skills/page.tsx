"use client";

import { useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useCrudModal } from "@/hooks/use-crud-modal";
import { useSortableItems } from "@/hooks/use-sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, GripVertical } from "lucide-react";
import { SkillCombobox } from "@/components/skill-combobox";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: string;
  yearsOfExperience: number;
  displayOrder: number;
}

const CATEGORIES = [
  { value: "frontend", label: "フロントエンド" },
  { value: "backend", label: "バックエンド" },
  { value: "infrastructure", label: "インフラ" },
  { value: "others", label: "その他" },
];

const SortableSkillItem = memo(function SortableSkillItem({
  skill,
  onEdit,
  onDelete,
}: {
  skill: Skill;
  onEdit: (skill: Skill) => void;
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
    id: skill.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryLabel =
    CATEGORIES.find((c) => c.value === skill.category)?.label || skill.category;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex-1 grid grid-cols-5 gap-4 items-center">
        <div>
          <p className="font-medium">{skill.name}</p>
        </div>
        <div>
          <Badge variant="outline">{categoryLabel}</Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{skill.proficiency}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            {skill.yearsOfExperience}年
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => onEdit(skill)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(skill.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

type SkillFormData = {
  name: string;
  category: string;
  proficiency: string;
  yearsOfExperience: number;
  displayOrder: number;
};

export default function SkillsPage() {
  const router = useRouter();
  const { session, isPending } = useRequireAuth();

  const {
    items: skills,
    setItems: setSkills,
    isLoading,
    isFetching,
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingSkill,
    formData,
    setFormData,
    fetchItems: fetchSkills,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
  } = useCrudModal<Skill, SkillFormData>({
    apiPath: "/api/skills",
    initialFormData: {
      name: "",
      category: "frontend",
      proficiency: "",
      yearsOfExperience: 0,
      displayOrder: 0,
    },
    mapItemToForm: (skill) => ({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      yearsOfExperience: skill.yearsOfExperience,
      displayOrder: skill.displayOrder,
    }),
    mapFormToPayload: (formData, isEditing, items) => ({
      ...formData,
      displayOrder: isEditing ? formData.displayOrder : items.length,
    }),
    messages: {
      create: "スキルを追加しました",
      update: "スキルを更新しました",
      delete: "スキルを削除しました",
      deleteConfirm: "本当に削除しますか？",
    },
  });

  useEffect(() => {
    if (session) {
      fetchSkills();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const { sensors, handleDragEnd, closestCenter } = useSortableItems({
    items: skills,
    setItems: setSkills,
    updateUrl: "/api/skills/{id}",
    getUpdateData: (skill) => ({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      yearsOfExperience: skill.yearsOfExperience,
    }),
    onError: fetchSkills,
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
          <h1 className="text-3xl font-bold">スキル管理</h1>
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
              <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingSkill ? "スキル編集" : "スキル追加"}
                  </DialogTitle>
                  <DialogDescription>
                    スキル情報を入力してください
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">スキル名</Label>
                    <SkillCombobox
                      value={formData.name}
                      onChange={(value) =>
                        setFormData({ ...formData, name: value })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">カテゴリ</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proficiency">習熟度</Label>
                    <Input
                      id="proficiency"
                      value={formData.proficiency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          proficiency: e.target.value,
                        })
                      }
                      required
                      disabled={isLoading}
                      placeholder="例: 3年以上の実務経験"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">経験年数（年）</Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.yearsOfExperience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearsOfExperience: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      disabled={isLoading}
                      placeholder="例: 3.5"
                    />
                    <p className="text-xs text-muted-foreground">
                      0.1刻みで入力できます（例: 0.5, 1.5, 3.0）
                    </p>
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
            <CardTitle>スキル一覧</CardTitle>
            <CardDescription>ドラッグして並び替えができます</CardDescription>
          </CardHeader>
          <CardContent>
            {skills.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                スキルが登録されていません
              </p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-4 px-14 pb-2 text-sm font-medium text-muted-foreground">
                  <div>スキル名</div>
                  <div>カテゴリ</div>
                  <div>習熟度</div>
                  <div>経験年数</div>
                  <div className="text-right">操作</div>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={skills.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {skills.map((skill) => (
                      <SortableSkillItem
                        key={skill.id}
                        skill={skill}
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
