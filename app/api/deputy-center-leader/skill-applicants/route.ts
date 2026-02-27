import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all skill applications
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for Center_Leader role
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstname: { contains: search, mode: 'insensitive' as any } },
        { surname: { contains: search, mode: 'insensitive' as any } },
        { email: { contains: search, mode: 'insensitive' as any } },
        { phone: { contains: search, mode: 'insensitive' as any } },
        { applicationNumber: { contains: search, mode: 'insensitive' as any } },
        { technicalInterest: { contains: search, mode: 'insensitive' as any } },
      ];
    }

    const applications = await prisma.skillApplication.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error('Error fetching skill applications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch skill applications' },
      { status: 500 }
    );
  }
}

// PATCH update a single skill application (e.g. status) for Center Leader
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Add authentication/authorization checks for Center_Leader role
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Application id and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'AWAITING_PAYMENT'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await prisma.skillApplication.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      application: updated,
    });
  } catch (error) {
    console.error('Error updating skill application (center-leader):', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update skill application' },
      { status: 500 }
    );
  }
}

