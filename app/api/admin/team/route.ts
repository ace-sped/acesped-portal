import { NextRequest, NextResponse } from 'next/server';
import { TeamRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// GET all team members
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role as TeamRole;
    }
    if (isActive !== null && isActive !== 'ALL') {
      where.isActive = isActive === 'true';
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
      team,
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

// POST create new team member
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role

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

    // Validate required fields
    if (!name || !slug || !role || !title || !email || !image || !bio || !qualifications) {
      return NextResponse.json(
        { success: false, message: 'Name, slug, role, title, email, image, bio, and qualifications are required' },
        { status: 400 }
      );
    }

    // Check if team member with slug already exists
    const existingMember = await prisma.team.findUnique({
      where: { slug },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, message: 'Team member with this slug already exists' },
        { status: 400 }
      );
    }

    // Handle image upload to Cloudinary if it's base64
    const { uploadBase64 } = require('@/lib/storage');
    let imageUrl = image;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      const uploadResult = await uploadBase64(imageUrl, 'team');
      if (uploadResult.success) {
        imageUrl = uploadResult.path;
      }
    }

    // Create team member
    const teamMember = await prisma.team.create({
      data: {
        name,
        slug,
        role: role as TeamRole,
        title,
        department: department || null,
        email,
        phone: phone || null,
        image: imageUrl,
        bio,
        qualifications: qualifications || [],
        researchAreas: researchAreas || null,
        linkedin: linkedin || null,
        twitter: twitter || null,
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: displayOrder || 0,
      },
    });

    return NextResponse.json({
      success: true,
      team: teamMember,
      message: 'Team member created successfully',
    });
  } catch (error: any) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create team member',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

