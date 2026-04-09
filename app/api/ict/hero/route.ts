import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  image: string;
  ctaPrimaryText?: string | null;
  ctaPrimaryHref?: string | null;
  ctaSecondaryText?: string | null;
  ctaSecondaryHref?: string | null;
  displayOrder: number;
  isActive: boolean;
};

async function getSlides(): Promise<HeroSlide[]> {
  return prisma.hero.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function GET() {
  try {
    const slides = await getSlides();
    return NextResponse.json({ success: true, slides });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch hero slides' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle = '',
      description,
      image,
      ctaPrimaryText = '',
      ctaPrimaryHref = '',
      ctaSecondaryText = '',
      ctaSecondaryHref = '',
      displayOrder = 0,
      isActive = true,
    } = body || {};

    if (!title || !description || !image) {
      return NextResponse.json(
        { success: false, message: 'Title, description and image are required' },
        { status: 400 }
      );
    }

    const newSlide = await prisma.hero.create({
      data: {
      title,
      subtitle,
      description,
      image,
      ctaPrimaryText,
      ctaPrimaryHref,
      ctaSecondaryText,
      ctaSecondaryHref,
      displayOrder: Number(displayOrder) || 0,
      isActive: Boolean(isActive),
      },
    });
    const nextSlides = await getSlides();

    return NextResponse.json({ success: true, slide: newSlide, slides: nextSlides });
  } catch (error) {
    console.error('Error creating hero slide:', error);
    return NextResponse.json({ success: false, message: 'Failed to create hero slide' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...payload } = body || {};
    if (!id) {
      return NextResponse.json({ success: false, message: 'Slide ID is required' }, { status: 400 });
    }

    const existing = await prisma.hero.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Slide not found' }, { status: 404 });
    }

    const updated = await prisma.hero.update({
      where: { id },
      data: {
        ...(payload.title !== undefined && { title: payload.title }),
        ...(payload.subtitle !== undefined && { subtitle: payload.subtitle }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.image !== undefined && { image: payload.image }),
        ...(payload.ctaPrimaryText !== undefined && { ctaPrimaryText: payload.ctaPrimaryText }),
        ...(payload.ctaPrimaryHref !== undefined && { ctaPrimaryHref: payload.ctaPrimaryHref }),
        ...(payload.ctaSecondaryText !== undefined && { ctaSecondaryText: payload.ctaSecondaryText }),
        ...(payload.ctaSecondaryHref !== undefined && { ctaSecondaryHref: payload.ctaSecondaryHref }),
        ...(payload.displayOrder !== undefined && { displayOrder: Number(payload.displayOrder) || 0 }),
        ...(payload.isActive !== undefined && { isActive: Boolean(payload.isActive) }),
      },
    });
    const nextSlides = await getSlides();

    return NextResponse.json({ success: true, slide: updated, slides: nextSlides });
  } catch (error) {
    console.error('Error updating hero slide:', error);
    return NextResponse.json({ success: false, message: 'Failed to update hero slide' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Slide ID is required' }, { status: 400 });
    }

    const existing = await prisma.hero.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Slide not found' }, { status: 404 });
    }

    await prisma.hero.delete({ where: { id } });
    const nextSlides = await getSlides();
    return NextResponse.json({ success: true, slides: nextSlides });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete hero slide' }, { status: 500 });
  }
}

