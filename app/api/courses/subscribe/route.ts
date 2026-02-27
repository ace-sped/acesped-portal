import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Create a course subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      courseSlug,
      firstname,
      surname,
      email,
      phoneNumber,
      address,
      city,
      state,
      country,
      dateOfBirth,
      gender,
      occupation,
      organization,
      reasonForSubscription,
      howDidYouHear,
      paymentMethod,
      paymentReference,
    } = body;

    // Validate required fields
    if (!courseSlug || !firstname || !surname || !email || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the course (try both Course and Program models)
    let course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      include: { program: true },
    });

    let courseId: string | null = null;
    
    if (!course) {
      // Try finding as a program (some courses are stored as programs)
      const program = await prisma.program.findUnique({
        where: { slug: courseSlug },
      });

      if (!program) {
        return NextResponse.json(
          { success: false, message: 'Course not found' },
          { status: 404 }
        );
      }
    } else {
      courseId = course.id;
    }

    // Generate subscription number
    const subscriptionNumber = `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create the subscription
    const subscription = await prisma.courseSubscription.create({
      data: {
        courseSlug,
        courseId,
        firstname,
        surname,
        email,
        phoneNumber,
        address,
        city,
        state,
        country,
        dateOfBirth,
        gender,
        occupation: occupation || null,
        organization: organization || null,
        reasonForSubscription,
        howDidYouHear,
        paymentMethod,
        paymentReference,
        subscriptionNumber,
        status: 'PENDING',
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Subscription submitted successfully',
      data: {
        id: subscription.id,
        subscriptionNumber: subscription.subscriptionNumber,
        courseSlug,
        email,
      },
    });
  } catch (error: any) {
    console.error('Error creating course subscription:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create subscription',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve course subscriptions (for admin use)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseSlug = searchParams.get('courseSlug');
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (courseSlug) {
      where.courseSlug = courseSlug;
    }
    if (email) {
      where.email = email;
    }
    if (status) {
      where.status = status;
    }

    // Fetch subscriptions with pagination
    const [subscriptions, total] = await Promise.all([
      prisma.courseSubscription.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.courseSubscription.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Subscriptions retrieved successfully',
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching course subscriptions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch subscriptions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

