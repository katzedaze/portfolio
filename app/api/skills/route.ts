import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { skill } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { skillSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function GET() {
  try {
    const skills = await db
      .select()
      .from(skill)
      .orderBy(skill.displayOrder, skill.name);
    // 経験年数を0.1刻みに変換（DBには10倍した整数で保存されている）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedSkills = skills.map((s: any) => ({
      ...s,
      yearsOfExperience: s.yearsOfExperience / 10,
    }));
    return NextResponse.json(formattedSkills);
  } catch (error) {
    console.error("Skills GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // バリデーション
    const validatedData = skillSchema.parse(body);

    await db.insert(skill).values({
      name: validatedData.name,
      category: validatedData.category,
      proficiency: validatedData.proficiency,
      yearsOfExperience: Math.round(validatedData.yearsOfExperience * 10), // 0.1刻みを整数化して保存
      displayOrder: validatedData.displayOrder,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Skills POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
