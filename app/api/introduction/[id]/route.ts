import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { introduction } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { introductionSchema } from "@/lib/validations";
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
    const validatedData = introductionSchema.parse(body);

    await db
      .update(introduction)
      .set({
        title: validatedData.title,
        content: validatedData.content,
        displayOrder: validatedData.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(introduction.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Introduction PUT error:", error);
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
    await db.delete(introduction).where(eq(introduction.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Introduction DELETE error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
