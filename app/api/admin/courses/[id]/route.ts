import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single course by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role

    const { id } = await context.params;
    const course = await prisma.course.findUnique({
      where: { id },
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

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT update course
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role

    const { id } = await context.params;
    const body = await request.json();
    const {
      title,
      slug,
      programId,
      overview,
      isActive,
      displayOrder,
      courseCode,
      courseType,
      programType,
      semester,
      creditHours,
    } = body;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug already exists
    if (slug && slug !== existingCourse.slug) {
      const slugExists = await prisma.course.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'Course with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // If programId is being changed, verify new program exists
    if (programId && programId !== existingCourse.programId) {
      const program = await prisma.program.findUnique({
        where: { id: programId },
      });

      if (!program) {
        return NextResponse.json(
          { success: false, message: 'Program not found' },
          { status: 400 }
        );
      }
    }

    // Update course
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(programId && { programId }),
        ...(overview && { overview }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder: typeof displayOrder === 'number' ? displayOrder : parseInt(displayOrder) || 0 }),
        ...(courseCode !== undefined && { courseCode: courseCode || null }),
        ...(courseType !== undefined && { courseType: courseType || null }),
        ...(programType !== undefined && { programType: programType || null }),
        ...(semester !== undefined && { semester: semester || null }),
        ...(creditHours !== undefined && { creditHours: creditHours ? parseInt(creditHours) : null }),
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
      message: 'Course updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update course',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE course
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role

    const { id } = await context.params;
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    const programId = course.programId;

    // Delete course
    await prisma.course.delete({
      where: { id },
    });



    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete course',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

