import { db } from '@/lib/db';
import { user, account } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 既存の admin@example.com ユーザーを検索
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, 'admin@example.com'))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { message: 'Admin user not found' },
        { status: 404 }
      );
    }

    const userId = existingUser[0].id;

    // アカウントを削除
    await db.delete(account).where(eq(account.userId, userId));

    // ユーザーを削除
    await db.delete(user).where(eq(user.id, userId));

    return NextResponse.json({
      success: true,
      message: 'Admin account deleted successfully',
    });
  } catch (error) {
    console.error('Error resetting admin:', error);
    return NextResponse.json(
      { error: 'Failed to reset admin account' },
      { status: 500 }
    );
  }
}
