import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for Center_Leader role

    const { id } = await params;
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for Center_Leader role

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      programId,
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
      isActive,
      displayOrder,
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
        ...(level && { level }),
        ...(duration !== undefined && { duration: duration || null }),
        ...(studyMode !== undefined && { studyMode: studyMode || null }),
        ...(fee !== undefined && { fee: fee || null }),
        ...(brochure !== undefined && { brochure: brochure || null }),
        ...(overview && { overview }),
        ...(objectives !== undefined && { objectives }),
        ...(curriculum !== undefined && { curriculum }),
        ...(requirements !== undefined && { requirements }),
        ...(careerPaths !== undefined && { careerPaths }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder: typeof displayOrder === 'number' ? displayOrder : parseInt(displayOrder) || 0 }),
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for Center_Leader role

    const { id } = await params;
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

