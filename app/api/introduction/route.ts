import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { introduction } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { introductionSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const intros = await db.select().from(introduction).orderBy(introduction.displayOrder);
    return NextResponse.json(intros);
  } catch (error) {
    console.error('Introduction GET error:', error);
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
    const validatedData = introductionSchema.parse(body);

    await db.insert(introduction).values({
      title: validatedData.title,
      content: validatedData.content,
      displayOrder: validatedData.displayOrder,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Introduction POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
