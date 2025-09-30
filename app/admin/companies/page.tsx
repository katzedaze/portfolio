'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, GripVertical, Building2, Calendar } from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { IndustryCombobox } from '@/components/industry-combobox';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Company {
  id: string;
  name: string;
  industry: string | null;
  description: string | null;
  joinDate: Date | null;
  leaveDate: Date | null;
  displayOrder: number;
}

function SortableCompanyItem({
  company,
  onEdit,
  onDelete,
}: {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: company.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
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
                <Button size="sm" variant="outline" onClick={() => onEdit(company)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(company.id)}>
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
                {formatDate(company.joinDate) || '入社日未設定'} 〜 {formatDate(company.leaveDate) || '在籍中'}
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
}

export default function CompaniesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    joinDate: '',
    leaveDate: '',
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
      router.push('/admin/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchCompanies();
    }
  }, [session]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = companies.findIndex((c) => c.id === active.id);
      const newIndex = companies.findIndex((c) => c.id === over.id);

      const newCompanies = arrayMove(companies, oldIndex, newIndex);
      setCompanies(newCompanies);

      // Update display orders
      try {
        await Promise.all(
          newCompanies.map((company, index) =>
            fetch(`/api/companies/${company.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: company.name,
                industry: company.industry,
                description: company.description,
                joinDate: company.joinDate ? new Date(company.joinDate).toISOString().split('T')[0] : null,
                leaveDate: company.leaveDate ? new Date(company.leaveDate).toISOString().split('T')[0] : null,
                displayOrder: index,
              }),
            })
          )
        );
      } catch (error) {
        console.error('Failed to update display order:', error);
        toast.error('表示順序の更新に失敗しました');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingCompany ? `/api/companies/${editingCompany.id}` : '/api/companies';
      const method = editingCompany ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          industry: formData.industry,
          description: formData.description,
          joinDate: formData.joinDate || null,
          leaveDate: formData.leaveDate || null,
          displayOrder: editingCompany ? formData.displayOrder : companies.length,
        }),
      });

      if (response.ok) {
        toast.success(editingCompany ? '企業情報を更新しました' : '企業を追加しました');
        setIsDialogOpen(false);
        resetForm();
        fetchCompanies();
      } else {
        const errorData = await response.json();
        if (errorData.details) {
          toast.error(`入力エラー: ${errorData.details[0]?.message}`);
        } else {
          toast.error('保存に失敗しました');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry || '',
      description: company.description || '',
      joinDate: company.joinDate ? new Date(company.joinDate).toISOString().split('T')[0] : '',
      leaveDate: company.leaveDate ? new Date(company.leaveDate).toISOString().split('T')[0] : '',
      displayOrder: company.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？この企業に紐付いているプロジェクトの企業情報もクリアされます。')) return;

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('企業を削除しました');
        fetchCompanies();
      } else {
        toast.error('削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('削除に失敗しました');
    }
  };

  const resetForm = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      industry: '',
      description: '',
      joinDate: '',
      leaveDate: '',
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
          <div>
            <h1 className="text-3xl font-bold">企業管理</h1>
            <p className="text-muted-foreground mt-2">所属企業の情報を管理します</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  新規追加
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCompany ? '企業情報編集' : '企業追加'}</DialogTitle>
                  <DialogDescription>企業情報を入力してください</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">社名 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={isLoading}
                      placeholder="例: 株式会社○○"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">業界</Label>
                    <IndustryCombobox
                      value={formData.industry}
                      onChange={(value) => setFormData({ ...formData, industry: value })}
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
                        onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="leaveDate">退社日</Label>
                      <Input
                        id="leaveDate"
                        type="date"
                        value={formData.leaveDate}
                        onChange={(e) => setFormData({ ...formData, leaveDate: e.target.value })}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">在籍中の場合は空欄にしてください</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">会社概要（マークダウン形式）</Label>
                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="edit">編集</TabsTrigger>
                        <TabsTrigger value="preview">プレビュー</TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit">
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading ? '保存中...' : '保存'}
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
            <Button onClick={() => router.push('/admin')} variant="outline">
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
                  <SortableContext items={companies.map((c) => c.id)} strategy={verticalListSortingStrategy}>
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
