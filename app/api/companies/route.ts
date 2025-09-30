import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { company } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { companySchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const companies = await db.select().from(company).orderBy(company.displayOrder, company.name);
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Companies GET error:', error);
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
    const validatedData = companySchema.parse(body);

    await db.insert(company).values({
      name: validatedData.name,
      industry: validatedData.industry || null,
      description: validatedData.description || null,
      joinDate: validatedData.joinDate ? new Date(validatedData.joinDate) : null,
      leaveDate: validatedData.leaveDate ? new Date(validatedData.leaveDate) : null,
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
    console.error('Companies POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
