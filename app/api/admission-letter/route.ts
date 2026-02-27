import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const applicationNumber =
      typeof body?.applicationNumber === 'string' ? body.applicationNumber.trim().toUpperCase() : '';

    if (!applicationNumber) {
      return NextResponse.json(
        {
          success: false,
          message: 'Application number is required.',
        },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { applicationNumber },
      select: {
        firstname: true,
        middlename: true,
        surname: true,
        programChoice: true,
        programType: true,
        admissionSession: true,
        modeOfStudy: true,
        status: true,
        email: true,
        phoneNumber: true,
        address: true,
        state: true,
        country: true,
        gender: true,
        dateOfBirth: true,
        acceptanceFeePaid: true,
        acceptancePaidAt: true,
        acceptancePaymentReference: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: 'No application found for the supplied application number.',
        },
        { status: 404 }
      );
    }

    if (application.status !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          message: 'This application is yet to be approved. Please check back later.',
        },
        { status: 400 }
      );
    }

    if (!application.acceptanceFeePaid) {
      return NextResponse.json(
        {
          success: false,
          message: 'You must accept your admission before processing the admission letter. Please complete and confirm the acceptance fee payment first.',
        },
        { status: 403 }
      );
    }

    const issuedOn = new Date().toISOString();

    return NextResponse.json({
      success: true,
      letter: {
        applicationNumber,
        firstname: application.firstname,
        middlename: application.middlename,
        surname: application.surname,
        applicantName: [application.firstname, application.middlename, application.surname].filter(Boolean).join(' '),
        programChoice: application.programChoice,
        programType: application.programType,
        admissionSession: application.admissionSession,
        modeOfStudy: application.modeOfStudy,
        email: application.email,
        phoneNumber: application.phoneNumber,
        address: application.address,
        state: application.state,
        country: application.country,
        gender: application.gender,
        dateOfBirth: application.dateOfBirth,
        issuedOn,
        acceptanceFeePaid: application.acceptanceFeePaid,
        acceptancePaidAt: application.acceptancePaidAt,
        acceptancePaymentReference: application.acceptancePaymentReference,
      },
    });
  } catch (error) {
    console.error('Admission letter lookup error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch admission letter. Please try again later.',
      },
      { status: 500 }
    );
  }
}


