import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET YouTube videos (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublished = searchParams.get('isPublished');
    const isFeatured = searchParams.get('isFeatured');
    const limit = searchParams.get('limit');

    const where: any = {};
    
    // Only show published videos by default for public endpoint
    if (isPublished !== null) {
      where.isPublished = isPublished === 'true';
    } else {
      where.isPublished = true; // Default to published only
    }
    
    if (category) {
      where.category = category;
    }
    
    if (isFeatured !== null) {
      where.isFeatured = isFeatured === 'true';
    }

    const take = limit ? parseInt(limit) : undefined;

    const videos = await prisma.youTubeVideo.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      take,
    });

    return NextResponse.json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch videos', videos: [] },
      { status: 500 }
    );
  }
}



