import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFriendlyErrorMessage } from '@/lib/friendly-error';
import { hasPaidApplicationFee, isNigerianApplicant } from '@/lib/application-fee';

const DEFAULT_FEE_KOBO = 26700 * 100;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const reference = typeof body?.reference === 'string' ? body.reference.trim() : '';
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
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found.' },
        { status: 404 }
      );
    }

    if (!isNigerianApplicant(application.nationality, application.country)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Application fee is not required for non-Nigerian applicants.',
        },
        { status: 400 }
      );
    }

    // One payment only — never overwrite an existing fee payment
    if (hasPaidApplicationFee(application.paymentReference, application.paymentProof)) {
      return NextResponse.json({
        success: true,
        message: 'Application fee already paid for this application. Only one payment is allowed.',
        alreadyPaid: true,
        application: {
          applicationNumber: application.applicationNumber,
          paymentReference: application.paymentReference,
          paymentMethod: application.paymentMethod,
        },
      });
    }

    // Same Paystack reference cannot be reused on another application
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
        {
          success: false,
          message: 'Payment service is not configured. Please contact support.',
        },
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

    if (typeof txData.amount !== 'number' || txData.amount < DEFAULT_FEE_KOBO * 0.5) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment amount does not match the expected application fee.',
        },
        { status: 400 }
      );
    }

    const metadata = txData.metadata || {};
    const metadataAppNumber =
      typeof metadata.applicationNumber === 'string'
        ? metadata.applicationNumber.trim().toUpperCase()
        : '';

    if (metadataAppNumber && metadataAppNumber !== applicationNumber) {
      return NextResponse.json(
        {
          success: false,
          message: 'This payment reference does not belong to this application number.',
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
        firstname: true,
        surname: true,
        email: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Application fee payment verified and recorded.',
      application: updated,
      amountPaid: txData.amount / 100,
      paidAt: txData.paid_at || null,
    });
  } catch (error) {
    console.error('Applicant payment verification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: getFriendlyErrorMessage(
          error,
          'Unable to verify payment right now. Please try again later.'
        ),
      },
      { status: 500 }
    );
  }
}
