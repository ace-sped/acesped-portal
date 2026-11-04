import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiErrorPayload } from '@/lib/friendly-error';

// GET single program by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const program = await prisma.program.findUnique({
      where: {
        slug,
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            subtitle: true,
            description: true,
            icon: true,
            color: true,
            isActive: true,
          },
        },
        courses: {
          where: {
            isActive: true,
          },
          orderBy: {
            courseCode: 'asc',
          },
        },
      },
    });

    if (!program || !program.isActive) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      program: program,
    });


  } catch (error: any) {
    console.error('Error fetching program:', error);

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      apiErrorPayload(error, 'Unable to load this program. Please try again.'),
      { status: 500 }
    );
  }
}

