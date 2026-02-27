import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all YouTube videos
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublished = searchParams.get('isPublished');
    const isFeatured = searchParams.get('isFeatured');

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (isPublished !== null) {
      where.isPublished = isPublished === 'true';
    }
    if (isFeatured !== null) {
      where.isFeatured = isFeatured === 'true';
    }

    const videos = await prisma.youTubeVideo.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// POST create new YouTube video
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role
    
    const body = await request.json();
    const {
      title,
      description,
      videoId,
      category,
      isPublished,
      isFeatured,
      displayOrder,
    } = body;

    // Validate required fields
    const missingFields: string[] = [];
    if (!title || title.trim() === '') missingFields.push('title');
    if (!videoId || videoId.trim() === '') missingFields.push('videoId');
    if (!category || category.trim() === '') missingFields.push('category');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['WELCOME', 'RESEARCH', 'ACHIEVEMENT', 'EVENT', 'ANNOUNCEMENT', 'STUDENT_STORIES', 'TUTORIAL'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
          receivedCategory: category
        },
        { status: 400 }
      );
    }

    // Create video in database
    const video = await prisma.youTubeVideo.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        videoId: videoId.trim(),
        category,
        isPublished: isPublished !== undefined ? isPublished : false,
        isFeatured: isFeatured !== undefined ? isFeatured : false,
        displayOrder: displayOrder || 0,
      },
    });

    return NextResponse.json({
      success: true,
      video,
      message: 'Video added successfully',
    });
  } catch (error: any) {
    console.error('Error creating YouTube video:', error);
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'A video with this videoId already exists',
          error: error.message
        },
        { status: 400 }
      );
    }

    // Handle model not found errors (if migration hasn't been run or Prisma client not regenerated)
    if (error.message?.includes('youtubeVideo') || error.message?.includes('YouTubeVideo') || error.message?.includes('youTubeVideo') || error.message?.includes('does not exist')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'YouTube video model not found. Please run: 1) npx prisma generate 2) npx prisma migrate dev',
          error: error.message,
          hint: 'The database table may not exist yet. Run migrations to create it.'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create video',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

