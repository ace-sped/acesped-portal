import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// GET all users
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role
    console.log('GET /api/admin/users hit');

    const users = await prisma.user.findMany({
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
    try {
      const fs = require('fs');
      fs.writeFileSync('debug-users-error.txt', String(error) + '\n' + (error instanceof Error ? error.stack : ''));
    } catch (e) {
      console.error('Failed to write error log:', e);
    }
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role

    const bcrypt = require('bcryptjs');
    const body = await request.json();
    const { email, firstname, surname, password, role, avatar, signature } = body;

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
        signature: signature || null,
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


