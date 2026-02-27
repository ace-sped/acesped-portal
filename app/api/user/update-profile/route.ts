import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function PUT(request: NextRequest) {
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
    const userId = payload.userId as string;

    const body = await request.json();
    const { phoneNumber, avatar } = body;

    if (!phoneNumber && !avatar) {
      return NextResponse.json(
        { success: false, message: 'No changes provided' },
        { status: 400 }
      );
    }

    const updates: any = {};

    if (phoneNumber) {
      // Validate phone number format (basic validation)
      const phoneRegex = /^[+]?[\d\s-()]+$/;
      if (!phoneRegex.test(phoneNumber)) {
        return NextResponse.json(
          { success: false, message: 'Invalid phone number format' },
          { status: 400 }
        );
      }
      updates.phoneNumber = phoneNumber;
    }

    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        email: true,
        firstname: true,
        surname: true,
        phoneNumber: true,
        avatar: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}








