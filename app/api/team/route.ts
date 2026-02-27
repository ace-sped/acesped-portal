import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all team members (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    
    // Only show active members for public endpoint
    where.isActive = true;
    
    if (role && role !== 'ALL') {
      where.role = role;
    }

    const team = await prisma.team.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      team: team || [],
    });
  } catch (error: any) {
    console.error('Error fetching team:', error);
    console.error('Error details:', error?.message, error?.stack);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch team',
        error: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

