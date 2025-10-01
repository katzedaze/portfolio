import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { projectSchema } from "@/lib/validations";
import {
  withErrorHandling,
  withAuth,
  validateRequest,
} from "@/lib/api-helpers";
import type { Project } from "@/lib/db/types";

/**
 * GET /api/projects
 * すべてのプロジェクトを取得（認証不要）
 */
export const GET = withErrorHandling(async (): Promise<Project[]> => {
  const projects = await db
    .select()
    .from(project)
    .orderBy(project.displayOrder, desc(project.startDate));

  return projects;
}, "Projects GET");

/**
 * POST /api/projects
 * 新しいプロジェクトを作成（認証必要）
 */
export const POST = withAuth(async (request: NextRequest) => {
  const validatedData = await validateRequest(request, projectSchema);

  await db.insert(project).values({
    companyId: validatedData.companyId || null,
    title: validatedData.title,
    startDate: new Date(validatedData.startDate),
    endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
    technologies: validatedData.technologies,
    description: validatedData.description,
    responsibilities: validatedData.responsibilities || null,
    achievements: validatedData.achievements || null,
    displayOrder: validatedData.displayOrder,
  });

  return { success: true };
}, "Projects POST");
