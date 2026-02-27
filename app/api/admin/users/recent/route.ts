import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET recent users (last 5)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstname: true,
        surname: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error fetching recent users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch recent users' },
      { status: 500 }
    );
  }
}

