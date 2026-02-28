import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single news by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role

    const { id } = await params;
    const news = await prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      return NextResponse.json(
        { success: false, message: 'News not found' },
        { status: 404 }
      );
    }

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

// PUT update news
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

    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews) {
      return NextResponse.json(
        { success: false, message: 'News not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug already exists
    if (slug && slug !== existingNews.slug) {
      const slugExists = await prisma.news.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'News with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Handle image upload to Cloudinary if it's base64
    const { uploadBase64 } = require('@/lib/storage');
    let imageUrl = image;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      const uploadResult = await uploadBase64(imageUrl, 'news');
      if (uploadResult.success) {
        imageUrl = uploadResult.path;
      }
    }

    // Update news
    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(category && { category }),
        ...(excerpt && { excerpt }),
        ...(content && { content }),
        ...(author && { author }),
        ...(imageUrl && { image: imageUrl }),
        ...(tags !== undefined && { tags: tags && Array.isArray(tags) && tags.length > 0 ? tags : undefined }),
        ...(publishedAt !== undefined && { publishedAt: publishedAt ? new Date(publishedAt) : null }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
    });

    return NextResponse.json({
      success: true,
      news,
      message: 'News updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update news',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE news
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role

    const { id } = await params;
    const news = await prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      return NextResponse.json(
        { success: false, message: 'News not found' },
        { status: 404 }
      );
    }

    // Delete news
    await prisma.news.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'News deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete news',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

