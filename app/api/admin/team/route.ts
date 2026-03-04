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

    // Validate required fields (email and qualifications are optional; slug can be auto-generated)
    if (!name || !role || !title || !image || !bio) {
      return NextResponse.json(
        { success: false, message: 'Name, role, title, image, and bio are required' },
        { status: 400 }
      );
    }

    // PostgreSQL btree index limit ~2704 bytes - slugs must stay under 200 chars
    const MAX_SLUG_LENGTH = 200;
    const rawSlug = String(slug || '').trim();
    const invalidSlug = rawSlug.length > MAX_SLUG_LENGTH || rawSlug.startsWith('data:') || rawSlug.startsWith('http');
    const finalSlug = !invalidSlug && rawSlug
      ? rawSlug.slice(0, MAX_SLUG_LENGTH)
      : String(name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .slice(0, MAX_SLUG_LENGTH) || `member-${Date.now()}`;
    if (!finalSlug || finalSlug.length > MAX_SLUG_LENGTH) {
      return NextResponse.json(
        { success: false, message: 'Invalid slug. Use a short hyphenated identifier (e.g. john-doe).' },
        { status: 400 }
      );
    }

    // Check if team member with slug already exists
    const existingMember = await prisma.team.findUnique({
      where: { slug: finalSlug },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, message: 'Team member with this slug already exists' },
        { status: 400 }
      );
    }

    // Handle image upload to Cloudinary if it's base64
    let imageUrl = image || '';
    if (imageUrl.startsWith('data:image')) {
      try {
        const { uploadBase64 } = require('@/lib/storage');
        const uploadResult = await uploadBase64(imageUrl, 'team');
        if (uploadResult.success && uploadResult.path) {
          imageUrl = uploadResult.path;
        }
      } catch (uploadError: any) {
        console.error('Image upload failed:', uploadError);
        return NextResponse.json(
          { success: false, message: 'Image upload failed. Please use a smaller image or try again.' },
          { status: 400 }
        );
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: 'Image is required' },
        { status: 400 }
      );
    }

    // Create team member
    const teamMember = await prisma.team.create({
      data: {
        name,
        slug: finalSlug,
        role: role as TeamRole,
        title,
        department: department || null,
        email: email || '',
        phone: phone || null,
        image: imageUrl,
        bio,
        qualifications: Array.isArray(qualifications) ? qualifications : [],
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
    const message = error?.message || 'Unknown error';
    const code = error?.code || '';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create team member',
        error: message,
        ...(process.env.NODE_ENV === 'development' && { code, stack: error?.stack }),
      },
      { status: 500 }
    );
  }
}

