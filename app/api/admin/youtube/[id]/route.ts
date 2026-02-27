import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single YouTube video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role
    
    const { id } = await params;

    const video = await prisma.youTubeVideo.findUnique({
      where: { id },
    });

    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error) {
    console.error('Error fetching YouTube video:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

// PUT update YouTube video
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role
    
    const { id } = await params;
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

    const video = await prisma.youTubeVideo.update({
      where: { id },
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
      message: 'Video updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating YouTube video:', error);
    
    // Handle Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Video not found',
          error: error.message
        },
        { status: 404 }
      );
    }

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

    // Handle model not found errors
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
        message: 'Failed to update video',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE YouTube video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role
    
    const { id } = await params;

    await prisma.youTubeVideo.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting YouTube video:', error);
    
    // Handle Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Video not found',
          error: error.message
        },
        { status: 404 }
      );
    }

    // Handle model not found errors
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
        message: 'Failed to delete video',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

