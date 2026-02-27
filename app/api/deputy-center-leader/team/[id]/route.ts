import { NextRequest, NextResponse } from 'next/server';
import { TeamRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// GET single team member by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for Center_Leader role
    
    const { id } = await params;
    const teamMember = await prisma.team.findUnique({
      where: { id },
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

// PUT update team member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for Center_Leader role
    
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      slug,
      role,
      title,
      department,
      email,
      phone,
      image,
      bio,
      qualifications,
      researchAreas,
      linkedin,
      twitter,
      isActive,
      displayOrder,
    } = body;

    // Check if team member exists
    const existingMember = await prisma.team.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: 'Team member not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug already exists
    if (slug && slug !== existingMember.slug) {
      const slugExists = await prisma.team.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'Team member with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update team member
    const teamMember = await prisma.team.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(role && { role: role as TeamRole }),
        ...(title && { title }),
        ...(department !== undefined && { department: department || null }),
        ...(email && { email }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(image && { image }),
        ...(bio && { bio }),
        ...(qualifications !== undefined && { qualifications }),
        ...(researchAreas !== undefined && { researchAreas: researchAreas || null }),
        ...(linkedin !== undefined && { linkedin: linkedin || null }),
        ...(twitter !== undefined && { twitter: twitter || null }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) || 0 }),
      },
    });

    return NextResponse.json({
      success: true,
      team: teamMember,
      message: 'Team member updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update team member',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for Center_Leader role
    
    const { id } = await params;
    const teamMember = await prisma.team.findUnique({
      where: { id },
    });

    if (!teamMember) {
      return NextResponse.json(
        { success: false, message: 'Team member not found' },
        { status: 404 }
      );
    }

    // Delete team member
    await prisma.team.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete team member',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

