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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pencil,
  Trash2,
  Plus,
  GripVertical,
  Building2,
  Calendar,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { IndustryCombobox } from "@/components/industry-combobox";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  description: string | null;
  joinDate: Date | null;
  leaveDate: Date | null;
  displayOrder: number;
}

const SortableCompanyItem = memo(function SortableCompanyItem({
  company,
  onEdit,
  onDelete,
}: {
  company: Company;
  onEdit: (company: Company) => void;
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
    id: company.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <button
            className="cursor-grab active:cursor-grabbing touch-none mt-1"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {company.name}
                </CardTitle>
                {company.industry && (
                  <CardDescription className="mt-1">
                    <Badge variant="outline">{company.industry}</Badge>
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(company)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(company.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      {(company.joinDate || company.leaveDate || company.description) && (
        <CardContent className="space-y-2">
          {(company.joinDate || company.leaveDate) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(company.joinDate) || "入社日未設定"} 〜{" "}
                {formatDate(company.leaveDate) || "在籍中"}
              </span>
            </div>
          )}
          {company.description && (
            <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-2">
              <MarkdownRenderer content={company.description} />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
});

type CompanyFormData = {
  name: string;
  industry: string;
  description: string;
  joinDate: string;
  leaveDate: string;
  displayOrder: number;
};

export default function CompaniesPage() {
  const router = useRouter();
  const { session, isPending } = useRequireAuth();

  const {
    items: companies,
    setItems: setCompanies,
    isLoading,
    isFetching,
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingCompany,
    formData,
    setFormData,
    fetchItems: fetchCompanies,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
  } = useCrudModal<Company, CompanyFormData>({
    apiPath: "/api/companies",
    initialFormData: {
      name: "",
      industry: "",
      description: "",
      joinDate: "",
      leaveDate: "",
      displayOrder: 0,
    },
    mapItemToForm: (company) => ({
      name: company.name,
      industry: company.industry || "",
      description: company.description || "",
      joinDate: company.joinDate
        ? new Date(company.joinDate).toISOString().split("T")[0]
        : "",
      leaveDate: company.leaveDate
        ? new Date(company.leaveDate).toISOString().split("T")[0]
        : "",
      displayOrder: company.displayOrder,
    }),
    mapFormToPayload: (formData, isEditing, items) => ({
      name: formData.name,
      industry: formData.industry,
      description: formData.description,
      joinDate: formData.joinDate || null,
      leaveDate: formData.leaveDate || null,
      displayOrder: isEditing ? formData.displayOrder : items.length,
    }),
    messages: {
      create: "企業を追加しました",
      update: "企業情報を更新しました",
      delete: "企業を削除しました",
      deleteConfirm:
        "本当に削除しますか？この企業に紐付いているプロジェクトの企業情報もクリアされます。",
    },
  });

  useEffect(() => {
    if (session) {
      fetchCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const { sensors, handleDragEnd, closestCenter } = useSortableItems({
    items: companies,
    setItems: setCompanies,
    updateUrl: "/api/companies/{id}",
    getUpdateData: (company) => ({
      name: company.name,
      industry: company.industry,
      description: company.description,
      joinDate: company.joinDate
        ? new Date(company.joinDate).toISOString().split("T")[0]
        : null,
      leaveDate: company.leaveDate
        ? new Date(company.leaveDate).toISOString().split("T")[0]
        : null,
    }),
    onError: fetchCompanies,
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
          <div>
            <h1 className="text-3xl font-bold">企業管理</h1>
            <p className="text-muted-foreground mt-2">
              所属企業の情報を管理します
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  新規追加
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCompany ? "企業情報編集" : "企業追加"}
                  </DialogTitle>
                  <DialogDescription>
                    企業情報を入力してください
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">社名 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      placeholder="例: 株式会社○○"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">業界</Label>
                    <IndustryCombobox
                      value={formData.industry}
                      onChange={(value) =>
                        setFormData({ ...formData, industry: value })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="joinDate">入社日</Label>
                      <Input
                        id="joinDate"
                        type="date"
                        value={formData.joinDate}
                        onChange={(e) =>
                          setFormData({ ...formData, joinDate: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="leaveDate">退社日</Label>
                      <Input
                        id="leaveDate"
                        type="date"
                        value={formData.leaveDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            leaveDate: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        在籍中の場合は空欄にしてください
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      会社概要（マークダウン形式）
                    </Label>
                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="edit">編集</TabsTrigger>
                        <TabsTrigger value="preview">プレビュー</TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit">
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="## 会社概要&#10;&#10;主要事業内容や特徴などを記載します。"
                          rows={10}
                          disabled={isLoading}
                          className="font-mono text-sm"
                        />
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="min-h-[240px] rounded-md border p-4 bg-background">
                          {formData.description ? (
                            <MarkdownRenderer content={formData.description} />
                          ) : (
                            <p className="text-muted-foreground text-center py-8">
                              プレビューがここに表示されます
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="flex gap-2 pt-4">
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
            <CardTitle>企業一覧</CardTitle>
            <CardDescription>
              ドラッグ&ドロップで表示順序を変更できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  企業が登録されていません
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={companies.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {companies.map((company) => (
                      <SortableCompanyItem
                        key={company.id}
                        company={company}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
