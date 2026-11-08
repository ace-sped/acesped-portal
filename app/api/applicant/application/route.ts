import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFriendlyErrorMessage } from '@/lib/friendly-error';
import { hasPaidApplicationFee, isNigerianApplicant } from '@/lib/application-fee';

export async function GET(request: NextRequest) {
  try {
    const applicationNumber = request.nextUrl.searchParams.get('applicationNumber')?.trim();

    if (!applicationNumber) {
      return NextResponse.json(
        { success: false, message: 'Application number is required.' },
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
        paymentMethod: true,
        paymentProof: true,
        acceptanceFeePaid: true,
        createdAt: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found.' },
        { status: 404 }
      );
    }

    const nigerian = isNigerianApplicant(application.nationality, application.country);
    const paid = hasPaidApplicationFee(
      application.paymentReference,
      application.paymentProof
    );

    let applicationFee = 26700;
    if (application.programChoice) {
      const program = await prisma.program.findFirst({
        where: {
          title: {
            equals: application.programChoice,
            mode: 'insensitive',
          },
        },
        select: { fee: true },
      });

      if (program?.fee) {
        const numeric = parseInt(String(program.fee).replace(/[₦,\s]/g, ''), 10);
        if (!Number.isNaN(numeric) && numeric > 0) {
          applicationFee = numeric;
        }
      }
    }

    return NextResponse.json({
      success: true,
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
        paymentMethod: application.paymentMethod,
        paymentProof: application.paymentProof,
        acceptanceFeePaid: application.acceptanceFeePaid,
        submittedAt: application.createdAt,
        isNigerian: nigerian,
        applicationFeeRequired: nigerian,
        applicationFeePaid: nigerian ? paid : true,
        applicationFeeWaived: !nigerian,
        applicationFeeAmount: applicationFee,
      },
    });
  } catch (error) {
    console.error('Error fetching applicant application:', error);
    return NextResponse.json(
      {
        success: false,
        message: getFriendlyErrorMessage(error, 'Unable to load application details.'),
      },
      { status: 500 }
    );
  }
}
