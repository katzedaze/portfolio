"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-require-auth";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function AccountPage() {
  const { session, isPending } = useRequireAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Email change
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      setCurrentEmail(session.user.email);
    }
  }, [session]);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/account/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });

      if (response.ok) {
        toast.success("メールアドレスを更新しました");
        setCurrentEmail(newEmail);
        setNewEmail("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "メールアドレスの更新に失敗しました");
      }
    } catch (error) {
      console.error("Email change error:", error);
      toast.error("メールアドレスの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("新しいパスワードが一致しません");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("パスワードは8文字以上で設定してください");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        toast.success("パスワードを更新しました");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "パスワードの更新に失敗しました");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("パスワードの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">アカウント設定</h1>
          <Button onClick={() => router.push("/admin")} variant="outline">
            ダッシュボードに戻る
          </Button>
        </div>

        <div className="space-y-6">
          {/* メールアドレス変更 */}
          <Card>
            <CardHeader>
              <CardTitle>メールアドレス変更</CardTitle>
              <CardDescription>
                ログイン用のメールアドレスを変更します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentEmail">現在のメールアドレス</Label>
                  <Input
                    id="currentEmail"
                    type="email"
                    value={currentEmail}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newEmail">新しいメールアドレス *</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="new@example.com"
                  />
                </div>

                <Button type="submit" disabled={isLoading || !newEmail}>
                  {isLoading ? "更新中..." : "メールアドレスを更新"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* パスワード変更 */}
          <Card>
            <CardHeader>
              <CardTitle>パスワード変更</CardTitle>
              <CardDescription>
                ログイン用のパスワードを変更します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">現在のパスワード *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="現在のパスワードを入力"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">新しいパスワード *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="新しいパスワード（8文字以上）"
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    新しいパスワード（確認） *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="新しいパスワードを再入力"
                    minLength={8}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  {isLoading ? "更新中..." : "パスワードを更新"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
