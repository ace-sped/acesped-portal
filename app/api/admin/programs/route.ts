import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all programs
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role

    const programs = await prisma.program.findMany({
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        headOfProgram: {
          select: {
            id: true,
            email: true,
            firstname: true,
            surname: true,
          },
        },
      },
      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    return NextResponse.json({
      success: true,
      programs,
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST create new program
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role

    const body = await request.json();
    const {
      title,
      courseCode,
      slug,
      level,
      duration,
      studyMode,
      fee,
      brochure,
      overview,
      objectives,
      curriculum,
      requirements,
      careerPaths,
      serviceId,
      headOfProgramId,
      displayOrder,
      isActive,
    } = body;

    // Validate all required fields
    if (!title || !slug || !level || !overview) {
      return NextResponse.json(
        { success: false, message: 'Title, slug, level, and overview are required' },
        { status: 400 }
      );
    }

    if (!duration) {
      return NextResponse.json(
        { success: false, message: 'Duration is required' },
        { status: 400 }
      );
    }

    if (!studyMode) {
      return NextResponse.json(
        { success: false, message: 'Study mode is required' },
        { status: 400 }
      );
    }

    if (!fee) {
      return NextResponse.json(
        { success: false, message: 'Fee is required' },
        { status: 400 }
      );
    }

    if (!brochure) {
      return NextResponse.json(
        { success: false, message: 'Brochure is required' },
        { status: 400 }
      );
    }

    if (!serviceId) {
      return NextResponse.json(
        { success: false, message: 'Service is required' },
        { status: 400 }
      );
    }

    // Optional fields: objectives, curriculum, requirements, careerPaths

    // Validate level enum
    const validLevels = ['CERTIFICATE', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD', 'MASTERS_AND_PHD', 'PGD', 'MSC'];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { success: false, message: `Invalid level. Must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate unique slug
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.program.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create program
    const program = await prisma.program.create({
      data: {
        title,
        courseCode: courseCode || null, // Convert empty string to null
        slug,
        level,
        duration,
        studyMode,
        fee,
        brochure,
        overview,
        objectives,
        curriculum,
        requirements,
        careerPaths,
        serviceId,
        headOfProgramId: headOfProgramId || null,
        displayOrder: displayOrder !== undefined ? parseInt(String(displayOrder)) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({
      success: true,
      program,
      message: 'Program created successfully',
    });
  } catch (error: any) {
    console.error('Error creating program:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create program: ' + (error.message || 'Unknown error'),
        error: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN',
        details: process.env.NODE_ENV === 'development' ? error.meta : undefined,
      },
      { status: 500 }
    );
  }
}

