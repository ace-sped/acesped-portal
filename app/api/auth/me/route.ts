import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Check if it's a lecturer token
    if (payload.isLecturerTable) {
      const lecturer = await prisma.lecturer.findUnique({
        where: { id: payload.userId as string },
        select: {
          id: true,
          email: true,
          firstname: true,
          surname: true,
          role: true,
          avatar: true,
        },
      });

      if (!lecturer) {
        return NextResponse.json(
          { success: false, message: 'Lecturer not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: { ...lecturer, role: 'Lecturer' },
      });
    }

    // Check if it's a student token (students are not stored in `users`)
    if (payload.isStudentTable) {
      const student = await prisma.student.findUnique({
        where: { id: payload.studentId as string },
        select: {
          id: true,
          personalInfo: {
            select: {
              email: true,
              firstname: true,
              surname: true,
              avatar: true,
            },
          },
          application: {
            select: {
              email: true,
              firstname: true,
              surname: true,
              avatar: true,
            },
          },
        },
      });

      if (!student) {
        return NextResponse.json(
          { success: false, message: 'Student not found' },
          { status: 404 }
        );
      }

      const email = student.personalInfo?.email || student.application?.email || '';
      const firstname = student.personalInfo?.firstname || student.application?.firstname || undefined;
      const surname = student.personalInfo?.surname || student.application?.surname || undefined;
      const avatar = student.personalInfo?.avatar || student.application?.avatar || undefined;

      return NextResponse.json({
        success: true,
        user: {
          id: student.id,
          email,
          firstname,
          surname,
          avatar,
          role: 'Student',
        },
      });
    }

    // Fetch fresh user data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        firstname: true,
        surname: true,
        role: true,
        avatar: true,
        signature: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}








