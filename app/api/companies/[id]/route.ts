import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { company } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { companySchema } from "@/lib/validations";
import { withAuth, validateRequest } from "@/lib/api-helpers";

/**
 * PUT /api/companies/[id]
 * 企業情報を更新（認証必要）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const validatedData = await validateRequest(request, companySchema);

    await db
      .update(company)
      .set({
        name: validatedData.name,
        industry: validatedData.industry || null,
        description: validatedData.description || null,
        joinDate: validatedData.joinDate
          ? new Date(validatedData.joinDate)
          : null,
        leaveDate: validatedData.leaveDate
          ? new Date(validatedData.leaveDate)
          : null,
        displayOrder: validatedData.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(company.id, id));

    return { success: true };
  }, "Companies PUT")(request);
}

/**
 * DELETE /api/companies/[id]
 * 企業を削除（認証必要）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    await db.delete(company).where(eq(company.id, id));

    return { success: true };
  }, "Companies DELETE")(request);
}
