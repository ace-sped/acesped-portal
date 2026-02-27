import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single team member by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const teamMember = await prisma.team.findFirst({
      where: { 
        slug,
        isActive: true, // Only return active members
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { success: false, message: 'Team member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      team: teamMember,
    });
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team member' },
      { status: 500 }
    );
  }
}

