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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, GripVertical, Calendar } from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { TechnologyMultiSelect } from '@/components/technology-multi-select';
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

interface Project {
  id: string;
  companyId: string | null;
  title: string;
  startDate: Date;
  endDate: Date | null;
  technologies: string[];
  description: string;
  responsibilities?: string;
  achievements?: string;
  displayOrder: number;
}

function SortableProjectItem({
  project,
  companies,
  onEdit,
  onDelete,
}: {
  project: Project;
  companies: Company[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
    });
  };

  const company = companies.find((c) => c.id === project.companyId);

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
                <CardTitle className="text-xl">{project.title}</CardTitle>
                {company && (
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {company.name}
                    </Badge>
                  </div>
                )}
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(project.startDate)} 〜 {project.endDate ? formatDate(project.endDate) : '現在'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(project)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(project.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech, index) => (
            <Badge key={index} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-3">
          <MarkdownRenderer content={project.description} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    companyId: null as string | null,
    title: '',
    startDate: '',
    endDate: '',
    technologies: [] as string[],
    description: '',
    responsibilities: '',
    achievements: '',
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
      fetchProjects();
      fetchCompanies();
    }
  }, [session]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);

      const newProjects = arrayMove(projects, oldIndex, newIndex);
      setProjects(newProjects);

      // Update displayOrder for all affected projects
      try {
        const updatePromises = newProjects.map((proj, index) =>
          fetch(`/api/projects/${proj.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyId: proj.companyId || null,
              title: proj.title,
              startDate: new Date(proj.startDate).toISOString().split('T')[0],
              endDate: proj.endDate ? new Date(proj.endDate).toISOString().split('T')[0] : null,
              technologies: proj.technologies,
              description: proj.description,
              responsibilities: proj.responsibilities || '',
              achievements: proj.achievements || '',
              displayOrder: index,
            }),
          })
        );

        await Promise.all(updatePromises);
        toast.success('表示順序を更新しました');
      } catch (error) {
        console.error('Failed to update order:', error);
        toast.error('表示順序の更新に失敗しました');
        fetchProjects(); // Revert on error
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: formData.companyId || null,
          title: formData.title,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          technologies: formData.technologies,
          description: formData.description,
          responsibilities: formData.responsibilities,
          achievements: formData.achievements,
          displayOrder: editingProject ? formData.displayOrder : projects.length,
        }),
      });

      if (response.ok) {
        toast.success(editingProject ? 'プロジェクトを更新しました' : 'プロジェクトを追加しました');
        setIsDialogOpen(false);
        resetForm();
        fetchProjects();
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

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      companyId: project.companyId || null,
      title: project.title,
      startDate: new Date(project.startDate).toISOString().split('T')[0],
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      technologies: project.technologies,
      description: project.description,
      responsibilities: project.responsibilities || '',
      achievements: project.achievements || '',
      displayOrder: project.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('プロジェクトを削除しました');
        fetchProjects();
      } else {
        toast.error('削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('削除に失敗しました');
    }
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      companyId: null,
      title: '',
      startDate: '',
      endDate: '',
      technologies: [],
      description: '',
      responsibilities: '',
      achievements: '',
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
          <h1 className="text-3xl font-bold">プロジェクト管理</h1>
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
                  <DialogTitle>{editingProject ? 'プロジェクト編集' : 'プロジェクト追加'}</DialogTitle>
                  <DialogDescription>プロジェクト情報を入力してください</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyId">企業</Label>
                    <Select
                      key={formData.companyId || 'none'}
                      value={formData.companyId || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, companyId: value === 'none' ? null : value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="companyId" className="w-full">
                        <SelectValue placeholder="企業を選択（任意）" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">なし</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      企業に紐付けない場合は「なし」を選択してください
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">プロジェクト名 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      disabled={isLoading}
                      placeholder="例: ECサイトリニューアルプロジェクト"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">開始日 *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">終了日（現在進行中の場合は空欄）</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <TechnologyMultiSelect
                    value={formData.technologies}
                    onChange={(value) => setFormData({ ...formData, technologies: value })}
                    disabled={isLoading}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="description">プロジェクト説明（マークダウン形式）*</Label>
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
                          placeholder="## 概要&#10;&#10;プロジェクトの概要をここに記載します。"
                          rows={8}
                          disabled={isLoading}
                          className="font-mono text-sm"
                        />
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="min-h-[200px] rounded-md border p-4 bg-background">
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

                  <div className="space-y-2">
                    <Label htmlFor="responsibilities">担当業務（マークダウン形式）</Label>
                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="edit">編集</TabsTrigger>
                        <TabsTrigger value="preview">プレビュー</TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit">
                        <Textarea
                          id="responsibilities"
                          value={formData.responsibilities}
                          onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                          placeholder="- フロントエンド開発（React, TypeScript）&#10;- API設計・実装&#10;- データベース設計"
                          rows={8}
                          disabled={isLoading}
                          className="font-mono text-sm"
                        />
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="min-h-[200px] rounded-md border p-4 bg-background">
                          {formData.responsibilities ? (
                            <MarkdownRenderer content={formData.responsibilities} />
                          ) : (
                            <p className="text-muted-foreground text-center py-8">
                              プレビューがここに表示されます
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="achievements">成果実績（マークダウン形式）</Label>
                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="edit">編集</TabsTrigger>
                        <TabsTrigger value="preview">プレビュー</TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit">
                        <Textarea
                          id="achievements"
                          value={formData.achievements}
                          onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                          placeholder="- ページ読み込み速度を50%改善&#10;- ユーザー満足度を30%向上&#10;- 開発効率を40%改善"
                          rows={8}
                          disabled={isLoading}
                          className="font-mono text-sm"
                        />
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="min-h-[200px] rounded-md border p-4 bg-background">
                          {formData.achievements ? (
                            <MarkdownRenderer content={formData.achievements} />
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

        <div className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                プロジェクトが登録されていません
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">ドラッグして並び替えができます</p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  {projects.map((project) => (
                    <SortableProjectItem
                      key={project.id}
                      project={project}
                      companies={companies}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
