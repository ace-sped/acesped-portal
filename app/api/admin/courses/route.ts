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
    const {
      title,
      slug,
      programId,
      isActive,
      displayOrder,
      courseCode,
      courseType,
      programType,
      semester,
      creditHours,
      overview,
    } = body;

    // Validate required fields
    if (!title || !slug || !programId || !overview) {
      return NextResponse.json(
        { success: false, message: 'Title, slug, programId, and overview are required' },
        { status: 400 }
      );
    }

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 400 }
      );
    }

    // Check if course with slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      return NextResponse.json(
        { success: false, message: 'Course with this slug already exists' },
        { status: 400 }
      );
    }

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
        creditHours: creditHours ? parseInt(creditHours) : null,
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

