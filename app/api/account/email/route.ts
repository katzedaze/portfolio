import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z, ZodError } from "zod";

const emailChangeSchema = z.object({
  newEmail: z.string().email("有効なメールアドレスを入力してください"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = emailChangeSchema.parse(body);

    // メールアドレスが既に使用されているかチェック
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.email, validatedData.newEmail))
      .limit(1);

    if (existingUsers.length > 0 && existingUsers[0].id !== session.user.id) {
      return NextResponse.json(
        { error: "このメールアドレスは既に使用されています" },
        { status: 400 }
      );
    }

    // メールアドレスを更新
    await db
      .update(user)
      .set({
        email: validatedData.newEmail,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation Error", details: (error as ZodError).issues },
        { status: 400 }
      );
    }
    console.error("Email change error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
