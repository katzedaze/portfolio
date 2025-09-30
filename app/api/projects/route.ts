import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { project } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { projectSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const projects = await db
      .select()
      .from(project)
      .orderBy(project.displayOrder, desc(project.startDate));
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects GET error:', error);
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
    const validatedData = projectSchema.parse(body);

    await db.insert(project).values({
      companyId: validatedData.companyId || null,
      title: validatedData.title,
      startDate: new Date(validatedData.startDate),
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      technologies: validatedData.technologies,
      description: validatedData.description,
      responsibilities: validatedData.responsibilities || null,
      achievements: validatedData.achievements || null,
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
    console.error('Projects POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
