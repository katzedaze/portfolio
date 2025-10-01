import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { profileSchema } from "@/lib/validations";
import {
  requireAuth,
  withAuth,
  validateRequest,
  handleApiError,
} from "@/lib/api-helpers";

/**
 * GET /api/profile
 * 現在のユーザーのプロフィールを取得（認証必要）
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const userProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, session.user.id))
      .limit(1);

    return Response.json(userProfile[0] || null);
  } catch (error) {
    return handleApiError(error, "Profile GET");
  }
}

/**
 * POST /api/profile
 * プロフィールを作成または更新（認証必要）
 */
export const POST = withAuth(async (request: NextRequest) => {
  const session = await requireAuth(request);
  const validatedData = await validateRequest(request, profileSchema);

  // 既存のプロフィールを確認
  const existingProfiles = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, session.user.id))
    .limit(1);
  const existingProfile = existingProfiles[0];

  if (existingProfile) {
    // 更新
    await db
      .update(profile)
      .set({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        postalCode: validatedData.postalCode || null,
        address: validatedData.address || null,
        website: validatedData.website || null,
        githubUrl: validatedData.githubUrl || null,
        twitterUrl: validatedData.twitterUrl || null,
        linkedinUrl: validatedData.linkedinUrl || null,
        bio: validatedData.bio || null,
        avatarUrl: validatedData.avatarUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(profile.userId, session.user.id));
  } else {
    // 新規作成
    await db.insert(profile).values({
      userId: session.user.id,
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      postalCode: validatedData.postalCode || null,
      address: validatedData.address || null,
      website: validatedData.website || null,
      githubUrl: validatedData.githubUrl || null,
      twitterUrl: validatedData.twitterUrl || null,
      linkedinUrl: validatedData.linkedinUrl || null,
      bio: validatedData.bio || null,
      avatarUrl: validatedData.avatarUrl || null,
    });
  }

  return { success: true };
}, "Profile POST");
