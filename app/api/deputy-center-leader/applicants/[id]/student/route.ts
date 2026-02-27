import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: applicationId } = await params;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Fetch the application with student relationship
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: {
          select: {
            id: true,
            matricNumber: true,
            registrationNumber: true,
            status: true,
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

    return NextResponse.json({
      success: true,
      student: application.student,
    });
  } catch (error) {
    console.error('Error fetching student info:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch student info: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
