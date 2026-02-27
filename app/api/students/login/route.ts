import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const { matricNumber, password } = await request.json();

    if (!matricNumber || !password) {
      return NextResponse.json(
        { success: false, message: 'Matriculation number and password are required' },
        { status: 400 }
      );
    }

    const normalizedMatric = typeof matricNumber === 'string' ? matricNumber.trim() : '';

    // Find student by matricNumber
    let student = await prisma.student.findFirst({
      where: {
        matricNumber: normalizedMatric,
      },
      include: {
        personalInfo: true,
        application: true,
      }
    });

    // If not found by matricNumber, return error immediately
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Invalid matriculation number or password' },
        { status: 401 }
      );
    }

    // Existing student - verify password
    if (!student.password) {
      return NextResponse.json(
        { success: false, message: 'Student account not properly configured. Please contact administration.' },
        { status: 401 }
      );
    }

    const storedPassword = student.password ?? '';
    const isBcryptHash = /^\$2[aby]\$/.test(storedPassword);
    let isPasswordValid = false;
    let shouldRehash = false;

    if (isBcryptHash) {
      isPasswordValid = await bcrypt.compare(password, storedPassword);
    } else {
      // Legacy plaintext support
      isPasswordValid = storedPassword === password;
      shouldRehash = isPasswordValid;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid matriculation number or password' },
        { status: 401 }
      );
    }

    if (shouldRehash) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.student.update({
        where: { id: student.id },
        data: { password: hashedPassword },
      });
    }

    // Create JWT token
    const token = await new SignJWT({
      studentId: student.id,
      role: 'Student',
      isStudentTable: true,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const email = student.personalInfo?.email || student.application?.email || '';
    const firstname = student.personalInfo?.firstname || student.application?.firstname || undefined;
    const surname = student.personalInfo?.surname || student.application?.surname || undefined;
    const avatar = student.personalInfo?.avatar || student.application?.avatar || undefined;

    // Set cookie with the token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: student.id,
        email,
        firstname,
        surname,
        avatar,
        role: 'Student',
      },
      student: {
        id: student.id,
        matricNumber: student.matricNumber,
        applicationNumber: student.application?.applicationNumber,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Student login error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

