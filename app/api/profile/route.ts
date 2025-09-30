import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { profile } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { profileSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, session.user.id))
      .limit(1);

    return NextResponse.json(userProfile[0] || null);
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // バリデーション
    const validatedData = profileSchema.parse(body);

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

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Profile POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
