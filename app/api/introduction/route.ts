import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { introduction } from "@/lib/db/schema";
import { introductionSchema } from "@/lib/validations";
import {
  withErrorHandling,
  withAuth,
  validateRequest,
} from "@/lib/api-helpers";
import type { Introduction } from "@/lib/db/types";

/**
 * GET /api/introduction
 * すべての自己PRを取得（認証不要）
 */
export const GET = withErrorHandling(async (): Promise<Introduction[]> => {
  const intros = await db
    .select()
    .from(introduction)
    .orderBy(introduction.displayOrder);

  return intros;
}, "Introduction GET");

/**
 * POST /api/introduction
 * 新しい自己PRを作成（認証必要）
 */
export const POST = withAuth(async (request: NextRequest) => {
  const validatedData = await validateRequest(request, introductionSchema);

  await db.insert(introduction).values({
    title: validatedData.title,
    content: validatedData.content,
    displayOrder: validatedData.displayOrder,
  });

  return { success: true };
}, "Introduction POST");
