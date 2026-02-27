import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const applicationNumber = typeof body?.applicationNumber === 'string' ? body.applicationNumber.trim() : '';

    if (!email || !applicationNumber) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and application number are required.',
        },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { applicationNumber },
      select: {
        id: true,
        firstname: true,
        surname: true,
        email: true,
        programChoice: true,
        admissionSession: true,
        applicationNumber: true,
        status: true,
        acceptanceFeePaid: true,
        acceptancePaidAt: true,
        acceptancePaymentReference: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: 'Application not found. Please confirm your application number.',
        },
        { status: 404 }
      );
    }

    if (application.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          message: 'The provided email does not match this application number.',
        },
        { status: 400 }
      );
    }

    if (application.status !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          message: 'This application has not been marked as admitted yet.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Error verifying acceptance:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify admission. Please try again later.',
      },
      { status: 500 }
    );
  }
}

