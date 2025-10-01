import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { skill } from "@/lib/db/schema";
import { skillSchema } from "@/lib/validations";
import {
  withErrorHandling,
  withAuth,
  validateRequest,
} from "@/lib/api-helpers";
import type { SkillResponse } from "@/lib/db/types";

/**
 * GET /api/skills
 * すべてのスキルを取得（認証不要）
 */
export const GET = withErrorHandling(async (): Promise<SkillResponse[]> => {
  const skills = await db
    .select()
    .from(skill)
    .orderBy(skill.displayOrder, skill.name);

  // 経験年数を0.1刻みに変換（DBには10倍した整数で保存されている）
  return skills.map((s: typeof skill.$inferSelect) => ({
    ...s,
    yearsOfExperience: s.yearsOfExperience / 10,
  }));
}, "Skills GET");

/**
 * POST /api/skills
 * 新しいスキルを作成（認証必要）
 */
export const POST = withAuth(async (request: NextRequest) => {
  const validatedData = await validateRequest(request, skillSchema);

  await db.insert(skill).values({
    name: validatedData.name,
    category: validatedData.category,
    proficiency: validatedData.proficiency,
    yearsOfExperience: Math.round(validatedData.yearsOfExperience * 10), // 0.1刻みを整数化して保存
    displayOrder: validatedData.displayOrder,
  });

  return { success: true };
}, "Skills POST");
