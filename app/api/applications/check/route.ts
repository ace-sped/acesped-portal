import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email is required.',
        },
        { status: 400 }
      );
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
      select: {
        applicationNumber: true,
        admissionSession: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      exists: Boolean(existingApplication),
      applicationNumber: existingApplication?.applicationNumber ?? null,
      admissionSession: existingApplication?.admissionSession ?? null,
    });
  } catch (error) {
    console.error('Error checking application:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check existing applications.',
      },
      { status: 500 }
    );
  }
}
