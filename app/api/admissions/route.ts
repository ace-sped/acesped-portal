import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session')?.trim();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Admission session is required.',
        },
        { status: 400 }
      );
    }

    const admissions = await prisma.application.findMany({
      where: {
        admissionSession: session,
        status: 'APPROVED',
      },
      orderBy: [
        { programChoice: 'asc' },
        { firstname: 'asc' },
      ],
      select: {
        id: true,
        firstname: true,
        surname: true,
        programChoice: true,
        admissionSession: true,
        applicationNumber: true,
        nationality: true,
        state: true,
      },
    });

    return NextResponse.json({
      success: true,
      admissions,
    });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch admission list.',
      },
      { status: 500 }
    );
  }
}













