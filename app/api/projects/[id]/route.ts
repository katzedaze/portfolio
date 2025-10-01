import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { projectSchema } from "@/lib/validations";
import { withAuth, validateRequest } from "@/lib/api-helpers";

/**
 * PUT /api/projects/[id]
 * プロジェクトを更新（認証必要）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const validatedData = await validateRequest(request, projectSchema);

    await db
      .update(project)
      .set({
        companyId: validatedData.companyId || null,
        title: validatedData.title,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        technologies: validatedData.technologies,
        description: validatedData.description,
        responsibilities: validatedData.responsibilities || null,
        achievements: validatedData.achievements || null,
        displayOrder: validatedData.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(project.id, id));

    return { success: true };
  }, "Projects PUT")(request);
}

/**
 * DELETE /api/projects/[id]
 * プロジェクトを削除（認証必要）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    await db.delete(project).where(eq(project.id, id));

    return { success: true };
  }, "Projects DELETE")(request);
}
