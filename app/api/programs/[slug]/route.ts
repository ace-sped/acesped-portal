import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Provide more specific error messages
    let errorMessage = 'Failed to fetch program';
    if (error?.code === 'P2002') {
      errorMessage = 'Database constraint violation';
    } else if (error?.code === 'P2025') {
      errorMessage = 'Program not found';
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          error: error?.message,
          code: error?.code
        })
      },
      { status: 500 }
    );
  }
}

