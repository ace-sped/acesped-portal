import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all courses
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (programId && programId !== 'ALL') {
      where.programId = programId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { courseCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          program: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      courses,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST create new course
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role

    const body = await request.json();
    const rawTitle = typeof body.title === 'string' ? body.title.trim() : '';
    const rawSlug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const rawOverview = typeof body.overview === 'string' ? body.overview.trim() : '';
    const programId = typeof body.programId === 'string' ? body.programId.trim() : '';
    const title = rawTitle || null;
    const slug = rawSlug || null;
    const overview = rawOverview || null;

    const {
      isActive,
      displayOrder,
      courseCode,
      courseType,
      programType,
      semester,
      creditHours,
    } = body;

    // Validate required fields and return specific error
    const missing: string[] = [];
    if (!title) missing.push('title');
    if (!slug) missing.push('slug');
    if (!programId) missing.push('program');
    if (!overview) missing.push('description');
    if (missing.length > 0) {
      console.warn('[POST /api/admin/courses] 400 - Missing fields:', missing);
      return NextResponse.json(
        { success: false, message: `Missing: ${missing.join(', ')}`, details: { missing } },
        { status: 400 }
      );
    }

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      console.warn('[POST /api/admin/courses] 400 - Program not found:', programId);
      return NextResponse.json(
        { success: false, message: `Program not found for ID: ${programId}` },
        { status: 400 }
      );
    }

    // Check if course with slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      console.warn('[POST /api/admin/courses] 400 - Duplicate slug:', slug);
      return NextResponse.json(
        { success: false, message: `Course slug "${slug}" already exists` },
        { status: 400 }
      );
    }

    // Parse creditHours safely (avoid NaN)
    const parsedCreditHours =
      creditHours != null && creditHours !== ''
        ? (() => {
            const n = parseInt(String(creditHours), 10);
            return Number.isNaN(n) ? null : n;
          })()
        : null;

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        programId,
        overview,
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: displayOrder !== undefined ? displayOrder : 0,
        courseCode: courseCode || null,
        courseType: courseType || null,
        programType: programType || null,
        semester: semester || null,
        creditHours: parsedCreditHours,
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });



    return NextResponse.json({
      success: true,
      course,
      message: 'Course created successfully',
    });
  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create course',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

