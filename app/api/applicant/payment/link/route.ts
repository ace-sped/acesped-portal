import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasPaidApplicationFee, isNigerianApplicant } from '@/lib/application-fee';
import { getFriendlyErrorMessage } from '@/lib/friendly-error';

/**
 * Link a successful Paystack payment (from /application or dashboard)
 * to an existing submitted application by email or application number.
 * Never overwrites an already-paid application.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const reference = typeof body?.reference === 'string' ? body.reference.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const applicationNumber =
      typeof body?.applicationNumber === 'string'
        ? body.applicationNumber.trim().toUpperCase()
        : '';

    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Payment reference is required.' },
        { status: 400 }
      );
    }

    if (!email && !applicationNumber) {
      return NextResponse.json(
        { success: false, message: 'Email or application number is required.' },
        { status: 400 }
      );
    }

    const application = await prisma.application.findFirst({
      where: applicationNumber
        ? {
            applicationNumber: {
              equals: applicationNumber,
              mode: 'insensitive',
            },
          }
        : {
            email: {
              equals: email,
              mode: 'insensitive',
            },
          },
      orderBy: { createdAt: 'desc' },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'No submitted application found to link this payment.' },
        { status: 404 }
      );
    }

    if (!isNigerianApplicant(application.nationality, application.country)) {
      return NextResponse.json({
        success: true,
        waived: true,
        message: 'Application fee is waived for this applicant.',
        applicationNumber: application.applicationNumber,
      });
    }

    if (hasPaidApplicationFee(application.paymentReference, application.paymentProof)) {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        message: 'Application fee already paid. Only one payment is allowed.',
        applicationNumber: application.applicationNumber,
        paymentReference: application.paymentReference,
      });
    }

    const referenceAlreadyUsed = await prisma.application.findFirst({
      where: {
        paymentReference: {
          equals: reference,
          mode: 'insensitive',
        },
        NOT: { id: application.id },
      },
      select: { applicationNumber: true },
    });

    if (referenceAlreadyUsed) {
      return NextResponse.json(
        {
          success: false,
          message:
            'This payment reference is already linked to another application. Only one payment is allowed per applicant.',
        },
        { status: 409 }
      );
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json(
        { success: false, message: 'Payment service is not configured.' },
        { status: 500 }
      );
    }

    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );
    const verificationResult = await verificationResponse.json().catch(() => null);

    if (!verificationResponse.ok || !verificationResult?.status) {
      return NextResponse.json(
        {
          success: false,
          message: verificationResult?.message || 'Unable to verify payment reference.',
        },
        { status: 400 }
      );
    }

    const txData = verificationResult.data;
    if (!txData || txData.status !== 'success') {
      return NextResponse.json(
        {
          success: false,
          message: 'This payment has not been completed successfully yet.',
        },
        { status: 400 }
      );
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        paymentReference: reference,
        paymentMethod: 'Paystack',
      },
      select: {
        applicationNumber: true,
        paymentReference: true,
        paymentMethod: true,
        email: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment linked to application successfully.',
      application: updated,
    });
  } catch (error) {
    console.error('Applicant payment link error:', error);
    return NextResponse.json(
      {
        success: false,
        message: getFriendlyErrorMessage(error, 'Unable to link payment right now.'),
      },
      { status: 500 }
    );
  }
}
