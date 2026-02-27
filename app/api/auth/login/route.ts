import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = typeof email === 'string' ? email.trim() : '';

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        surname: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      // Check if they are a lecturer trying to login here
      const lecturer = await prisma.lecturer.findFirst({
        where: {
          email: { equals: normalizedEmail, mode: 'insensitive' },
        },
      });

      if (lecturer) {
        return NextResponse.json(
          { success: false, message: 'Please use the Lecturer Portal to login' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const storedPassword = user.password ?? '';
    const isBcryptHash = /^\$2[aby]\$/.test(storedPassword);
    let isPasswordValid = false;
    let shouldRehash = false;

    if (isBcryptHash) {
      isPasswordValid = await bcrypt.compare(password, storedPassword);
    } else {
      isPasswordValid = storedPassword === password;
      shouldRehash = isPasswordValid;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (shouldRehash) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    }

    // Verify user has a valid role
    // We strictly use the role from the database, allowing custom roles to work.
    if (!user.role) {
      return NextResponse.json(
        { success: false, message: 'User has no assigned role' },
        { status: 403 }
      );
    }

    const canonicalRole = user.role;

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: canonicalRole,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Create response with user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    // Set cookie with the token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { ...userWithoutPassword, role: canonicalRole },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    if (error && typeof error === 'object') {
      const err = error as { message?: unknown; name?: unknown; stack?: unknown };
      console.error('Login error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
    }
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
