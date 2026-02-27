import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all news
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for Center_Leader role
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublished = searchParams.get('isPublished');

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (isPublished !== null) {
      where.isPublished = isPublished === 'true';
    }

    const news = await prisma.news.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      news,
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST create new news
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for Center_Leader role
    
    const body = await request.json();
    const {
      title,
      slug,
      category,
      excerpt,
      content,
      author,
      image,
      tags,
      publishedAt,
      isPublished,
      isFeatured,
    } = body;

    // Validate required fields
    if (!title || !slug || !category || !excerpt || !content || !author || !image) {
      return NextResponse.json(
        { success: false, message: 'Title, slug, category, excerpt, content, author, and image are required' },
        { status: 400 }
      );
    }

    // Check if news with slug already exists
    const existingNews = await prisma.news.findUnique({
      where: { slug },
    });

    if (existingNews) {
      return NextResponse.json(
        { success: false, message: 'News with this slug already exists' },
        { status: 400 }
      );
    }

    // Create news
    const news = await prisma.news.create({
      data: {
        title,
        slug,
        category,
        excerpt,
        content,
        author,
        image,
        tags: tags || null,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        isPublished: isPublished !== undefined ? isPublished : false,
        isFeatured: isFeatured !== undefined ? isFeatured : false,
      },
    });

    return NextResponse.json({
      success: true,
      news,
      message: 'News created successfully',
    });
  } catch (error: any) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create news',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

