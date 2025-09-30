import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { company } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { companySchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // バリデーション
    const validatedData = companySchema.parse(body);

    await db
      .update(company)
      .set({
        name: validatedData.name,
        industry: validatedData.industry || null,
        description: validatedData.description || null,
        joinDate: validatedData.joinDate ? new Date(validatedData.joinDate) : null,
        leaveDate: validatedData.leaveDate ? new Date(validatedData.leaveDate) : null,
        displayOrder: validatedData.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(company.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Companies PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(company).where(eq(company.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Companies DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
