import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET all users (excluding SUPER_ADMIN for Deputy Center Leaders)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for Deputy_Center_Leader role

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');

    // Build where clause
    const whereClause: any = {
      role: {
        notIn: ['SUPER_ADMIN'], // Deputy Center Leaders cannot view SUPER_ADMIN users
      },
    };

    // If role filter is provided, add it to the where clause
    if (roleFilter) {
      whereClause.role = roleFilter;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstname: true,
        surname: true,
        avatar: true,
        role: true,

        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST create new user (Deputy Center Leaders cannot create SUPER_ADMIN, Center_Leader or Deputy_Center_Leader users)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for Deputy_Center_Leader role

    const body = await request.json();
    const { email, firstname, surname, password, role, avatar } = body;

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role exists in Role table
    const existingRole = await prisma.role.findUnique({ where: { role } });
    if (!existingRole) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Deputy Center Leaders cannot create SUPER_ADMIN users
    if (role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to create SUPER_ADMIN users' },
        { status: 403 }
      );
    }

    // Deputy Center Leaders cannot create Center_Leader users
    if (role === 'Center_Leader') {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to create Center Leader users' },
        { status: 403 }
      );
    }

    // Deputy Center Leaders cannot create Deputy_Center_Leader users (prevent privilege escalation/duplication)
    if (role === 'Deputy_Center_Leader') {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to create Deputy Center Leader users' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstname: firstname || null,
        surname: surname || null,
        avatar: avatar || null,
        password: hashedPassword,
        role,

      },
      select: {
        id: true,
        email: true,
        firstname: true,
        surname: true,
        avatar: true,
        role: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'User created successfully',
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
