import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all courses
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for Center_Leader role

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    const where = programId ? { programId } : {};

    const courses = await prisma.course.findMany({
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
    });

    return NextResponse.json({
      success: true,
      courses,
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
    // TODO: Add authentication check for Center_Leader role

    const body = await request.json();
    const {
      title,
      slug,
      programId,
      overview,
      isActive,
      displayOrder,
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

