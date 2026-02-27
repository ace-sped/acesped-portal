import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single service by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role
    
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch service' 
      },
      { status: 500 }
    );
  }
}

// PUT update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role
    
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      subtitle,
      description,
      icon,
      color,
      totalCourses,
      displayOrder,
      isActive,
    } = body;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug already exists
    if (slug && slug !== existingService.slug) {
      const slugExists = await prisma.service.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'Service with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update service
    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(subtitle !== undefined && { subtitle: subtitle || null }),
        ...(description && { description }),
        ...(icon !== undefined && { icon: icon || null }),
        ...(color !== undefined && { color: color || null }),
        ...(totalCourses !== undefined && { totalCourses }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      service,
      message: 'Service updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update service',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN or Center_Leader role
    
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    // Delete service
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete service',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

