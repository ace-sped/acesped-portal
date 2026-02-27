import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all news
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role
    
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
    // TODO: Add authentication check for SUPER_ADMIN role
    
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
      // images field is not in schema, so we ignore it
    } = body;

    // Validate required fields with detailed error messages
    const missingFields: string[] = [];
    if (!title || title.trim() === '') missingFields.push('title');
    if (!slug || slug.trim() === '') missingFields.push('slug');
    if (!category || category.trim() === '') missingFields.push('category');
    if (!excerpt || excerpt.trim() === '') missingFields.push('excerpt');
    if (!content || content.trim() === '') missingFields.push('content');
    if (!author || author.trim() === '') missingFields.push('author');
    if (!image || image.trim() === '') missingFields.push('image');

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

    // Validate category enum
    const validCategories = ['RESEARCH', 'ACHIEVEMENT', 'EVENT', 'ANNOUNCEMENT', 'COLLABORATION'];
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
        title: title.trim(),
        slug: slug.trim(),
        category,
        excerpt: excerpt.trim(),
        content: content.trim(),
        author: author.trim(),
        image: image.trim(),
        tags: tags && Array.isArray(tags) && tags.length > 0 ? tags : undefined,
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
    
    // Handle Prisma validation errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'A news item with this slug already exists',
          error: error.message
        },
        { status: 400 }
      );
    }

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

