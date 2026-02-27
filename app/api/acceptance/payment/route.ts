import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ACCEPTANCE_FEE_KOBO = 26000 * 100;
const ACCEPTANCE_PURPOSE = 'ACE-SPED Acceptance Fee';

const extractApplicationNumber = (metadata: any): string | null => {
  if (!metadata) return null;

  if (typeof metadata.applicationNumber === 'string' && metadata.applicationNumber.trim().length > 0) {
    return metadata.applicationNumber.trim().toUpperCase();
  }

  if (Array.isArray(metadata.custom_fields)) {
    for (const field of metadata.custom_fields) {
      if (
        typeof field?.variable_name === 'string' &&
        field.variable_name.toLowerCase().includes('application') &&
        typeof field?.value === 'string' &&
        field.value.trim().length > 0
      ) {
        return field.value.trim().toUpperCase();
      }
    }
  }

  if (typeof metadata?.application_number === 'string' && metadata.application_number.trim().length > 0) {
    return metadata.application_number.trim().toUpperCase();
  }

  return null;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const reference = typeof body?.reference === 'string' ? body.reference.trim() : '';
    const providedAppNumber =
      typeof body?.applicationNumber === 'string' ? body.applicationNumber.trim().toUpperCase() : '';

    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Payment reference is required.' },
        { status: 400 }
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
      const message = verificationResult?.message || 'Unable to verify payment reference.';
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    const txData = verificationResult.data;
    if (!txData || txData.status !== 'success') {
      return NextResponse.json(
        {
          success: false,
          message: 'This payment reference has not been marked as successful yet.',
        },
        { status: 400 }
      );
    }

    if (typeof txData.amount !== 'number' || txData.amount < ACCEPTANCE_FEE_KOBO) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment amount is below the required acceptance fee.',
        },
        { status: 400 }
      );
    }

    const metadata = txData.metadata || {};
    const metadataPurpose =
      typeof metadata.purpose === 'string'
        ? metadata.purpose
        : Array.isArray(metadata.custom_fields)
        ? metadata.custom_fields.find((field: any) => field?.display_name?.includes('purpose'))?.value
        : null;

    if (metadataPurpose && metadataPurpose !== ACCEPTANCE_PURPOSE) {
      return NextResponse.json(
        {
          success: false,
          message: 'This payment reference does not correspond to an ACE-SPED acceptance fee.',
        },
        { status: 400 }
      );
    }

    const paymentApplicationNumber = extractApplicationNumber(metadata);
    const applicationNumber = providedAppNumber || paymentApplicationNumber;

    if (!applicationNumber) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unable to determine the application number for this payment reference.',
        },
        { status: 400 }
      );
    }

    if (providedAppNumber && paymentApplicationNumber && providedAppNumber !== paymentApplicationNumber) {
      return NextResponse.json(
        {
          success: false,
          message: 'Provided application number does not match the payment record.',
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
        applicationNumber: true,
        acceptanceFeePaid: true,
        acceptancePaymentReference: true,
        acceptancePaidAt: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: 'No application matches this application number.',
        },
        { status: 404 }
      );
    }

    if (application.acceptanceFeePaid && application.acceptancePaymentReference && application.acceptancePaymentReference !== reference) {
      return NextResponse.json(
        {
          success: false,
          message: 'Acceptance fee has already been confirmed for this application. Please contact admissions before attempting another payment.',
        },
        { status: 400 }
      );
    }

    const paidAtRaw = txData.paid_at || txData.paidAt || txData.created_at || txData.transaction_date;
    const paidAt = paidAtRaw ? new Date(paidAtRaw) : new Date();

    if (application.acceptanceFeePaid && application.acceptancePaymentReference === reference) {
      return NextResponse.json({
        success: true,
        message: 'Acceptance fee already confirmed.',
        application,
      });
    }

    const updated = await prisma.application.update({
      where: { applicationNumber },
      data: {
        acceptanceFeePaid: true,
        acceptancePaymentReference: reference,
        acceptancePaidAt: paidAt,
      },
      select: {
        id: true,
        firstname: true,
        surname: true,
        email: true,
        applicationNumber: true,
        acceptanceFeePaid: true,
        acceptancePaymentReference: true,
        acceptancePaidAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Acceptance fee verified successfully.',
      application: updated,
    });
  } catch (error) {
    console.error('Acceptance payment verification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to verify payment right now. Please try again later.',
      },
      { status: 500 }
    );
  }
}


