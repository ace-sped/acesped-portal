import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Slug aliases mapping (e.g., website-development -> full-stack-web-development)
const slugAliases: Record<string, string> = {
  'website-development': 'full-stack-web-development',
};

// GET single course by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Course slug is required' },
        { status: 400 }
      );
    }
    
    // Get the aliased slug if it exists
    const aliasedSlug = slugAliases[slug];
    
    // Try to find course (program) - first with original slug, then with aliased slug
    const slugsToTry = aliasedSlug ? [slug, aliasedSlug] : [slug];
    
    let course = null;
    try {
      for (const trySlug of slugsToTry) {
        course = await prisma.program.findFirst({
          where: { 
            slug: trySlug,
            isActive: true,
          },
          include: {
            service: {
              select: {
                id: true,
                title: true,
                slug: true,
                color: true,
              },
            },
          },
        });
        
        if (course) {
          console.log(`Course found with slug: ${trySlug}`);
          // Rename 'service' to 'program' for consistency with course page expectations
          const courseData = {
            ...course,
            program: course.service,
          };
          delete (courseData as any).service;
          course = courseData as any;
          break;
        }
      }
    } catch (dbError: any) {
      console.error('Database query error:', dbError);
      // Re-throw with more context
      throw new Error(`Database error: ${dbError?.message || 'Unknown database error'}`);
    }

    if (!course) {
      // Log available courses for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        try {
          const allCourses = await prisma.program.findMany({
            where: { isActive: true },
            select: { slug: true, title: true },
            take: 10,
          });
          console.log('Available course slugs:', allCourses.map(c => c.slug));
        } catch (err) {
          console.error('Error fetching available courses for debugging:', err);
        }
      }
      
      console.error(`Course not found with slug: ${slug}${aliasedSlug ? ` or ${aliasedSlug}` : ''}`);
      return NextResponse.json(
        { success: false, message: `Course not found with slug: ${slug}` },
        { status: 404 }
      );
    }

    // Ensure the course data is properly serializable
    try {
      return NextResponse.json({
        success: true,
        course,
      });
    } catch (serializeError: any) {
      console.error('Error serializing course data:', serializeError);
      throw new Error(`Failed to serialize course data: ${serializeError?.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.error('Error fetching course:', error);
    
    // Provide more detailed error information in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Failed to fetch course: ${error?.message || 'Unknown error'}`
      : 'Failed to fetch course';
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          error: error?.message,
          stack: error?.stack 
        })
      },
      { status: 500 }
    );
  }
}

