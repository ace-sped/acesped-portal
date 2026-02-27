import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all services
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role
    
    const services = await prisma.service.findMany({
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
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch services' 
      },
      { status: 500 }
    );
  }
}

// POST create new service
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role
    
    const body = await request.json();
    const {
      title,
      slug,
      subtitle,
      description,
      icon,
      color,
      displayOrder,
      isActive,
    } = body;

    // Validate required fields
    if (!title || !slug || !description) {
      return NextResponse.json(
        { success: false, message: 'Title, slug, and description are required' },
        { status: 400 }
      );
    }

    // Check if service with slug already exists
    const existingService = await prisma.service.findUnique({
      where: { slug },
    });

    if (existingService) {
      return NextResponse.json(
        { success: false, message: 'Service with this slug already exists' },
        { status: 400 }
      );
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        title,
        slug,
        subtitle: subtitle || null,
        description,
        icon: icon || null,
        color: color || null,
        totalCourses: 0, // Will be auto-calculated from programs
        displayOrder: displayOrder !== undefined ? displayOrder : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({
      success: true,
      service,
      message: 'Service created successfully',
    });
  } catch (error: any) {
    console.error('Error creating service:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create service',
        error: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN',
        details: process.env.NODE_ENV === 'development' ? error.meta : undefined,
      },
      { status: 500 }
    );
  }
}

