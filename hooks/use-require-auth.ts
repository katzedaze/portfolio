"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

/**
 * 認証が必要なページで使用するカスタムフック
 * セッションがない場合は自動的にログインページにリダイレクトする
 *
 * @returns セッション情報とローディング状態
 */
export function useRequireAuth() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin/login");
    }
  }, [session, isPending, router]);

  return { session, isPending };
}
