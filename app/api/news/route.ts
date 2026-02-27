import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all news (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublished = searchParams.get('isPublished');
    const isFeatured = searchParams.get('isFeatured');

    const where: any = {};
    
    // Check total news count first (with error handling)
    let allNewsCount = 0;
    let publishedCount = 0;
    try {
      allNewsCount = await prisma.news.count();
      publishedCount = await prisma.news.count({ where: { isPublished: true } });
      console.log(`Total news in database: ${allNewsCount}, Published: ${publishedCount}`);
    } catch (countError: any) {
      console.error('Error counting news:', countError);
      // Continue with query anyway
    }
    
    // Only show published news for public endpoint
    // If there are news but none published, show all for testing/debugging
    if (publishedCount === 0 && allNewsCount > 0) {
      console.log('No published news found, showing all news for testing');
      // Don't filter by isPublished - show all news
    } else {
      where.isPublished = true;
    }
    
    if (category && category !== 'All') {
      where.category = category.toUpperCase();
    }

    // Only filter by isFeatured if explicitly requested
    // This allows fetching all published news and filtering on frontend
    if (isFeatured === 'true') {
      where.isFeatured = true;
    } else if (isFeatured === 'false') {
      where.isFeatured = false;
    }
    // If isFeatured is not specified, return both featured and non-featured

    // Build orderBy - use createdAt as primary sort since publishedAt can be null
    const news = await prisma.news.findMany({
      where: Object.keys(where).length > 0 ? where : {},
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    console.log(`Found ${news.length} news items matching criteria`);

    return NextResponse.json({
      success: true,
      news: news || [],
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    console.error('Error details:', error?.message, error?.stack);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch news',
        error: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

