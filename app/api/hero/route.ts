import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const limit = Number(searchParams.get('limit') || 0);

    const where: { isActive?: boolean } = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const slides = await prisma.hero.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      ...(limit > 0 ? { take: limit } : {}),
    });

    return NextResponse.json({ success: true, slides });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hero slides' },
      { status: 500 }
    );
  }
}

