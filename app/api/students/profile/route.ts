import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const studentId = payload.studentId as string;

    if (!payload.isStudentTable || !studentId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Fetch student data with all related information
    const student = await prisma.student.findFirst({
      where: { id: studentId },
      include: {
        personalInfo: true,
        application: true,
        nextOfKin: true,
        sponsors: true,
        programmes: {
          include: {
            program: {
              select: {
                title: true,
                level: true,
                slug: true,
              }
            }
          }
        },
        education: true,
        employment: true,
        medical: true,
      }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}





