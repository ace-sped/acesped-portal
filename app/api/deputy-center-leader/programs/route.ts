import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all programs
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for Center_Leader role

    const programs = await prisma.program.findMany({
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            slug: true,
            isActive: true,
          },
          orderBy: [
            { displayOrder: 'asc' },
            { createdAt: 'desc' },
          ],
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
    // TODO: Add authentication check for Center_Leader role

    const body = await request.json();
    const {
      title,
      slug,
      level,
      overview,
      isActive,
    } = body;

    // Validate required fields
    if (!title || !slug || !overview) {
      return NextResponse.json(
        { success: false, message: 'Title, slug, and overview are required' },
        { status: 400 }
      );
    }

    const validLevels = ['CERTIFICATE', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD', 'MASTERS_AND_PHD'];
    if (!level || !validLevels.includes(level)) {
      return NextResponse.json(
        { success: false, message: `Invalid level. Must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if program with slug already exists
    const existingProgram = await prisma.program.findUnique({
      where: { slug },
    });

    if (existingProgram) {
      return NextResponse.json(
        { success: false, message: 'Program with this slug already exists' },
        { status: 400 }
      );
    }

    // Create program
    const program = await prisma.program.create({
      data: {
        title,
        slug,
        level,
        overview,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        courses: true,
      },
    });

    return NextResponse.json({
      success: true,
      program,
      message: 'Program created successfully',
    });
  } catch (error: any) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create program',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

