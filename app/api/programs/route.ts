import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all active programs (public endpoint)
export async function GET(request: NextRequest) {
  try {
    // Fetch all active academic programs from the database
    const programs = await prisma.program.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    return NextResponse.json({
      success: true,
      programs,
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

