import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { introduction } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { introductionSchema } from "@/lib/validations";
import { withAuth, validateRequest } from "@/lib/api-helpers";

/**
 * PUT /api/introduction/[id]
 * 自己PRを更新（認証必要）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const validatedData = await validateRequest(request, introductionSchema);

    await db
      .update(introduction)
      .set({
        title: validatedData.title,
        content: validatedData.content,
        displayOrder: validatedData.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(introduction.id, id));

    return { success: true };
  }, "Introduction PUT")(request);
}

/**
 * DELETE /api/introduction/[id]
 * 自己PRを削除（認証必要）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    await db.delete(introduction).where(eq(introduction.id, id));

    return { success: true };
  }, "Introduction DELETE")(request);
}
