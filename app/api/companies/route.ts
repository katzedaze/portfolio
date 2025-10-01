import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { company } from "@/lib/db/schema";
import { companySchema } from "@/lib/validations";
import {
  withErrorHandling,
  withAuth,
  validateRequest,
} from "@/lib/api-helpers";
import type { Company } from "@/lib/db/types";

/**
 * GET /api/companies
 * すべての企業を取得（認証不要）
 */
export const GET = withErrorHandling(async (): Promise<Company[]> => {
  const companies = await db
    .select()
    .from(company)
    .orderBy(company.displayOrder, company.name);

  return companies;
}, "Companies GET");

/**
 * POST /api/companies
 * 新しい企業を作成（認証必要）
 */
export const POST = withAuth(async (request: NextRequest) => {
  const validatedData = await validateRequest(request, companySchema);

  await db.insert(company).values({
    name: validatedData.name,
    industry: validatedData.industry || null,
    description: validatedData.description || null,
    joinDate: validatedData.joinDate ? new Date(validatedData.joinDate) : null,
    leaveDate: validatedData.leaveDate
      ? new Date(validatedData.leaveDate)
      : null,
    displayOrder: validatedData.displayOrder,
  });

  return { success: true };
}, "Companies POST");
