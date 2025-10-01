"use client";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  User,
  Settings,
  Code,
  FileText,
  Briefcase,
  Building2,
  LogOut,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
  const { session, isPending } = useRequireAuth();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              管理ダッシュボード
            </h1>
            <p className="text-muted-foreground mt-2">
              ポートフォリオの管理画面
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              公開ページを見る
            </Button>
            <ThemeToggle />
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>

        {/* ダッシュボードカード */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="mt-4">プロフィール管理</CardTitle>
              <CardDescription>
                自己紹介とプロフィール情報を編集
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full group-hover:bg-primary/90"
                onClick={() => router.push("/admin/profile")}
              >
                編集する
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform">
                  <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <CardTitle className="mt-4">アカウント設定</CardTitle>
              <CardDescription>
                メールアドレスとパスワードの変更
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full group-hover:bg-primary/90"
                onClick={() => router.push("/admin/account")}
              >
                設定する
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform">
                  <Code className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="mt-4">技術スタック管理</CardTitle>
              <CardDescription>技術スキルの追加・編集・削除</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full group-hover:bg-primary/90"
                onClick={() => router.push("/admin/skills")}
              >
                管理する
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <CardTitle className="mt-4">自己PR管理</CardTitle>
              <CardDescription>自己PRを編集</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full group-hover:bg-primary/90"
                onClick={() => router.push("/admin/introduction")}
              >
                編集する
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <CardTitle className="mt-4">企業管理</CardTitle>
              <CardDescription>所属企業の追加・編集・削除</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full group-hover:bg-primary/90"
                onClick={() => router.push("/admin/companies")}
              >
                管理する
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="mt-4">プロジェクト管理</CardTitle>
              <CardDescription>職務経歴の追加・編集・削除</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full group-hover:bg-primary/90"
                onClick={() => router.push("/admin/projects")}
              >
                管理する
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* クイックリンク */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">クイックアクセス</CardTitle>
            <CardDescription>よく使う機能への素早いアクセス</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
              >
                公開ページを見る
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/profile")}
              >
                プロフィール編集
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/skills")}
              >
                スキル管理
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/companies")}
              >
                企業管理
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/projects")}
              >
                プロジェクト管理
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
