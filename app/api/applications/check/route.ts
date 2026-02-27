import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim();
    const admissionSession = searchParams.get('admissionSession')?.trim();

    if (!email || !admissionSession) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and admission session are required.',
        },
        { status: 400 }
      );
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        email,
        admissionSession,
      },
      select: {
        applicationNumber: true,
      },
    });

    return NextResponse.json({
      success: true,
      exists: Boolean(existingApplication),
      applicationNumber: existingApplication?.applicationNumber ?? null,
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













