import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiErrorPayload } from '@/lib/friendly-error';

// GET all active services (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: { programs: true },
        },
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

    // Map services to include the actual program count as totalCourses
    const servicesWithCount = services.map(service => ({
      ...service,
      totalCourses: service._count.programs, // Use actual count from database
    }));

    return NextResponse.json({
      success: true,
      services: servicesWithCount,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      apiErrorPayload(error, 'Unable to load services. Please try again.'),
      { status: 500 }
    );
  }
}

