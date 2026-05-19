import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single news article by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let article = await prisma.news.findUnique({
      where: { slug },
    });

    if (!article) {
      article = await prisma.news.findFirst({
        where: {
          slug: { equals: slug, mode: 'insensitive' },
        },
      });
    }

    if (!article) {
      return NextResponse.json(
        { success: false, message: 'News article not found' },
        { status: 404 }
      );
    }

    // Match list endpoint: require published unless nothing is published in DB
    const publishedCount = await prisma.news.count({ where: { isPublished: true } });
    if (publishedCount > 0 && !article.isPublished) {
      return NextResponse.json(
        { success: false, message: 'News article not found' },
        { status: 404 }
      );
    }

    await prisma.news.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      news: article,
    });
  } catch (error) {
    console.error('Error fetching news article:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch news article' },
      { status: 500 }
    );
  }
}
