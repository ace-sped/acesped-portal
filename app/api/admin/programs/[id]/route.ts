import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single program by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role

    const { id } = await params;
    const program = await prisma.program.findUnique({
      where: { id },
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
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role


    const { id } = await params;
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

    // Handle brochure upload to Cloudinary if it's base64
    const { uploadBase64 } = require('@/lib/storage');
    let brochureUrl = brochure;
    if (brochureUrl && brochureUrl.startsWith('data:')) {
      const uploadResult = await uploadBase64(brochureUrl, 'programs/brochures');
      if (uploadResult.success) {
        brochureUrl = uploadResult.path;
      }
    }

    // Update program
    const program = await prisma.program.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(courseCode !== undefined && { courseCode: courseCode || null }),
        ...(slug && { slug }),
        ...(level && { level }),
        ...(duration !== undefined && { duration: duration || null }),
        ...(studyMode !== undefined && { studyMode: studyMode || null }),
        ...(fee !== undefined && { fee: fee || null }),
        ...(brochureUrl !== undefined && { brochure: brochureUrl || null }),
        ...(overview && { overview }),
        ...(objectives !== undefined && { objectives: objectives || [] }),
        ...(curriculum !== undefined && { curriculum: curriculum || [] }),
        ...(requirements !== undefined && { requirements: requirements || [] }),
        ...(careerPaths !== undefined && { careerPaths: careerPaths || [] }),
        ...(serviceId !== undefined && { serviceId: serviceId || null }),
        ...(headOfProgramId !== undefined && { headOfProgramId: headOfProgramId || null }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(String(displayOrder)) || 0 }),
        ...(isActive !== undefined && { isActive }),
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
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role

    const { id } = await params;

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id },
    });

    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    // Check for dependent records (StudentProgramme)
    const enrolledStudentsCount = await prisma.studentProgramme.count({
      where: { programId: id }
    });

    if (enrolledStudentsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete program: ${enrolledStudentsCount} students are currently enrolled/associated with this program.`
        },
        { status: 400 }
      );
    }

    // Delete program
    await prisma.program.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Program deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting program:', error);

    // Prisma generic foreign key constraint error code
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete program because it is referenced by other records (e.g. Students).',
          error: error.message
        },
        { status: 400 }
      );
    }

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

