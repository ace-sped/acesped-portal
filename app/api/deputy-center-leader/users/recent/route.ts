import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET recent users (last 5, excluding SUPER_ADMIN)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for Center_Leader role

    const users = await prisma.user.findMany({
      where: {
        role: {
          notIn: ['SUPER_ADMIN', 'Center_Leader', 'Deputy_Center_Leader'],
        },
      },
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

