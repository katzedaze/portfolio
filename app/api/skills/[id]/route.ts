import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { skill } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { skillSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // バリデーション
    const validatedData = skillSchema.parse(body);

    await db
      .update(skill)
      .set({
        name: validatedData.name,
        category: validatedData.category,
        proficiency: validatedData.proficiency,
        yearsOfExperience: Math.round(validatedData.yearsOfExperience * 10), // 0.1刻みを整数化して保存
        displayOrder: validatedData.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(skill.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Skills PUT error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(skill).where(eq(skill.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Skills DELETE error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
