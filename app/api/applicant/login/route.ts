import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFriendlyErrorMessage } from '@/lib/friendly-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const applicationNumber =
      typeof body.applicationNumber === 'string' ? body.applicationNumber.trim() : '';
    const nationality =
      typeof body.nationality === 'string' ? body.nationality.trim() : '';

    if (!applicationNumber || !nationality) {
      return NextResponse.json(
        {
          success: false,
          message: 'Application number and nationality are required.',
        },
        { status: 400 }
      );
    }

    const application = await prisma.application.findFirst({
      where: {
        applicationNumber: {
          equals: applicationNumber,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        applicationNumber: true,
        firstname: true,
        surname: true,
        email: true,
        nationality: true,
        country: true,
        programType: true,
        programChoice: true,
        admissionSession: true,
        modeOfStudy: true,
        status: true,
        paymentReference: true,
        acceptanceFeePaid: true,
        createdAt: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: 'No application found for that application number.',
        },
        { status: 404 }
      );
    }

    const nationalityMatch =
      application.country?.toLowerCase() === nationality.toLowerCase() ||
      application.nationality?.toLowerCase() === nationality.toLowerCase();

    if (!nationalityMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nationality does not match this application. Please try again.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      application: {
        applicationNumber: application.applicationNumber,
        firstname: application.firstname,
        surname: application.surname,
        email: application.email,
        nationality: application.country || application.nationality,
        programType: application.programType,
        programChoice: application.programChoice,
        admissionSession: application.admissionSession,
        modeOfStudy: application.modeOfStudy,
        status: application.status,
        paymentReference: application.paymentReference,
        acceptanceFeePaid: application.acceptanceFeePaid,
        submittedAt: application.createdAt,
      },
    });
  } catch (error) {
    console.error('Applicant login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: getFriendlyErrorMessage(
          error,
          'Unable to verify your application. Please try again.'
        ),
      },
      { status: 500 }
    );
  }
}
