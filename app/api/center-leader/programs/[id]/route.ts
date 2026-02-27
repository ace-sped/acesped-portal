import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single program by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for Center_Leader role
    
    const { id } = await params;
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: [
            { displayOrder: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      program,
    });
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

// PUT update program
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
      subtitle,
      description,
      icon,
      color,
      heroImage,
      level,
      overview,
      totalCourses,
      isActive,
    } = body;

    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id },
    });

    if (!existingProgram) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug already exists
    if (slug && slug !== existingProgram.slug) {
      const slugExists = await prisma.program.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'Program with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Count courses for totalCourses (use provided value or count from database)
    const courseCount = totalCourses !== undefined 
      ? totalCourses 
      : await prisma.course.count({
          where: { programId: id },
        });

    // Update program
    const program = await prisma.program.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(level && { level }),
        ...(subtitle !== undefined && { subtitle: subtitle || null }),
        ...(description && { description }),
        ...(icon !== undefined && { icon: icon || null }),
        ...(color !== undefined && { color: color || null }),
        ...(heroImage !== undefined && { heroImage: heroImage || null }),
        ...(overview && { overview }),
        ...(totalCourses !== undefined && { totalCourses: courseCount }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        courses: {
          orderBy: [
            { displayOrder: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      program,
      message: 'Program updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update program',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE program
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for Center_Leader role
    
    const { id } = await params;
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: [
            { displayOrder: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    // Delete program (courses will be cascade deleted)
    await prisma.program.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Program deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete program',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

