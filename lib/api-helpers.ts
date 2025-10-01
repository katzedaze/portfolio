import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ZodError, ZodSchema } from "zod";

/**
 * 認証エラー
 */
export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * 認証チェックヘルパー
 * セッションが存在しない場合は UnauthorizedError をスロー
 */
export async function requireAuth(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

/**
 * リクエストボディのバリデーション
 * Zod スキーマを使用してバリデーションを行い、型安全な結果を返す
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * エラーハンドリング
 * ZodError, UnauthorizedError, その他のエラーを適切に処理
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation Error", details: error.issues },
      { status: 400 }
    );
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.error(`${context} error:`, error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

/**
 * API ハンドラーをエラーハンドリングでラップ
 * try-catch を自動的に追加し、エラーを適切に処理
 */
export function withErrorHandling<T>(
  handler: () => Promise<T>,
  errorContext: string
) {
  return async (): Promise<NextResponse> => {
    try {
      const result = await handler();
      return NextResponse.json(result);
    } catch (error) {
      return handleApiError(error, errorContext);
    }
  };
}

/**
 * 認証が必要な API ハンドラーをラップ
 * 認証チェックとエラーハンドリングを自動的に追加
 */
export function withAuth<T>(
  handler: (request: NextRequest) => Promise<T>,
  errorContext: string
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      await requireAuth(request);
      const result = await handler(request);
      return NextResponse.json(result);
    } catch (error) {
      return handleApiError(error, errorContext);
    }
  };
}
