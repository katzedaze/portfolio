import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { skill } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { skillSchema } from "@/lib/validations";
import { withAuth, validateRequest } from "@/lib/api-helpers";

/**
 * PUT /api/skills/[id]
 * スキルを更新（認証必要）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const validatedData = await validateRequest(request, skillSchema);

    await db
      .update(skill)
      .set({
        name: validatedData.name,
        category: validatedData.category,
        proficiency: validatedData.proficiency,
        yearsOfExperience: Math.round(validatedData.yearsOfExperience * 10), // 0.1刻みを整数化して保存
        displayOrder: validatedData.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(skill.id, id));

    return { success: true };
  }, "Skills PUT")(request);
}

/**
 * DELETE /api/skills/[id]
 * スキルを削除（認証必要）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    await db.delete(skill).where(eq(skill.id, id));

    return { success: true };
  }, "Skills DELETE")(request);
}
