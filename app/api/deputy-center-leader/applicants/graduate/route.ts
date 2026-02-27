import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = payload.role as string;
      
      // Check if user has Deputy Center Leader role
      if (userRole !== 'Deputy_Center_Leader' && userRole !== 'SUPER_ADMIN' && userRole !== 'Center_Leader') {
        return NextResponse.json(
          { success: false, message: 'Unauthorized. Deputy Center Leader access required.' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Fetch the application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: {
          include: {
            programmes: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if application is approved
    if (application.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, message: 'Only approved applications can be graduated' },
        { status: 400 }
      );
    }

    // Check if student record exists for this application
    if (!application.student) {
      return NextResponse.json(
        {
          success: false,
          message: 'No student record found for this application. Please migrate to student first.',
        },
        { status: 400 }
      );
    }

    // Check if student is already graduated
    if (application.student.status === 'GRADUATED') {
      return NextResponse.json(
        { success: false, message: 'Student is already graduated' },
        { status: 400 }
      );
    }

    // Update student status and programme status in a transaction
    await prisma.$transaction(async (tx) => {
      // Update student status to GRADUATED
      await tx.student.update({
        where: { id: application.student!.id },
        data: {
          status: 'GRADUATED',
        },
      });

      // Update all student programmes to COMPLETED
      await tx.studentProgramme.updateMany({
        where: {
          studentId: application.student!.id,
          status: {
            in: ['ADMITTED', 'REGISTERED', 'IN_PROGRESS'],
          },
        },
        data: {
          status: 'COMPLETED',
          endDate: new Date(),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Student successfully graduated',
      student: {
        id: application.student.id,
        matricNumber: application.student.matricNumber,
        status: 'GRADUATED',
      },
    });
  } catch (error) {
    console.error('Error graduating student:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to graduate student: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
