import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET programs by service slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // First, find the service by slug
    const service = await prisma.service.findUnique({
      where: { 
        slug,
        isActive: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    // Fetch programs for this service
    const programs = await prisma.program.findMany({
      where: {
        serviceId: service.id,
        isActive: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      programs,
      service: {
        id: service.id,
        title: service.title,
        slug: service.slug,
      },
    });
  } catch (error) {
    console.error('Error fetching programs by service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}














