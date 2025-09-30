import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
  newPassword: z.string().min(8, "パスワードは8文字以上で設定してください"),
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
    const validatedData = passwordChangeSchema.parse(body);

    // Better Authの changePassword を使用
    try {
      await auth.api.changePassword({
        body: {
          newPassword: validatedData.newPassword,
          currentPassword: validatedData.currentPassword,
          revokeOtherSessions: false,
        },
        headers: request.headers,
      });

      return NextResponse.json({ success: true });
    } catch (authError) {
      return NextResponse.json(
        { error: "パスワードの更新に失敗しました" },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
