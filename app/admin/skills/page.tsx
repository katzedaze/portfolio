"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
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
import { toast } from "sonner";
import { Pencil, Trash2, Plus, GripVertical } from "lucide-react";
import { SkillCombobox } from "@/components/skill-combobox";
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

function SortableSkillItem({
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
}

export default function SkillsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "frontend",
    proficiency: "",
    yearsOfExperience: 0,
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
      fetchSkills();
    }
  }, [session]);

  const fetchSkills = async () => {
    try {
      const response = await fetch("/api/skills");
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = skills.findIndex((s) => s.id === active.id);
      const newIndex = skills.findIndex((s) => s.id === over.id);

      const newSkills = arrayMove(skills, oldIndex, newIndex);
      setSkills(newSkills);

      // Update displayOrder for all affected skills
      try {
        const updatePromises = newSkills.map((skill, index) =>
          fetch(`/api/skills/${skill.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: skill.name,
              category: skill.category,
              proficiency: skill.proficiency,
              yearsOfExperience: skill.yearsOfExperience,
              displayOrder: index,
            }),
          })
        );

        await Promise.all(updatePromises);
        toast.success("表示順序を更新しました");
      } catch (error) {
        console.error("Failed to update order:", error);
        toast.error("表示順序の更新に失敗しました");
        fetchSkills(); // Revert on error
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingSkill
        ? `/api/skills/${editingSkill.id}`
        : "/api/skills";
      const method = editingSkill ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          displayOrder: editingSkill ? formData.displayOrder : skills.length,
        }),
      });

      if (response.ok) {
        toast.success(
          editingSkill ? "スキルを更新しました" : "スキルを追加しました"
        );
        setIsDialogOpen(false);
        resetForm();
        fetchSkills();
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

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      yearsOfExperience: skill.yearsOfExperience,
      displayOrder: skill.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("スキルを削除しました");
        fetchSkills();
      } else {
        toast.error("削除に失敗しました");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("削除に失敗しました");
    }
  };

  const resetForm = () => {
    setEditingSkill(null);
    setFormData({
      name: "",
      category: "frontend",
      proficiency: "",
      yearsOfExperience: 0,
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
