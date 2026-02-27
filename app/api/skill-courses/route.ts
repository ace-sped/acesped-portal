import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET programs for skill applications (public endpoint)
// Fetches active programs (used as skill programs) and returns them in a `courses` array
// to stay backward-compatible with the existing frontend.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceSlugFilter =
      searchParams.get('serviceSlug') || 'ace-sped-innovation-vocational-entrepreneurship-training-ivet-hub';

    // Prefer programs under the IVET-HUB / skill service, but fall back to all active programs
    let programs = await prisma.program.findMany({
      where: {
        isActive: true,
        service: {
          slug: {
            contains: serviceSlugFilter,
            mode: 'insensitive',
          },
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        fee: true,
        duration: true,
        studyMode: true,
        level: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // If none found for that service, return all active programs
    if (!programs || programs.length === 0) {
      programs = await prisma.program.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          fee: true,
          duration: true,
          studyMode: true,
          level: true,
        },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      });
    }

    // For compatibility with the existing frontend, return as `courses`
    return NextResponse.json({
      success: true,
      courses: programs,
    });
  } catch (error) {
    console.error('Error fetching skill programs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

