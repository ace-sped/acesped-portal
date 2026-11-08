import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasPaidApplicationFee, isNigerianApplicant } from '@/lib/application-fee';
import { getFriendlyErrorMessage } from '@/lib/friendly-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const applicationNumber =
      typeof body?.applicationNumber === 'string'
        ? body.applicationNumber.trim()
        : '';

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
          alreadyPaid: true,
          waived: true,
        },
        { status: 400 }
      );
    }

    if (hasPaidApplicationFee(application.paymentReference, application.paymentProof)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Application fee already paid. Only one payment is allowed.',
          alreadyPaid: true,
          paymentReference: application.paymentReference,
        },
        { status: 409 }
      );
    }

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

    const headerOrigin = request.headers.get('origin');
    let baseUrl = headerOrigin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
      baseUrl = new URL(baseUrl).origin;
    } catch {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }
    const callbackUrl = `${baseUrl}/applicant/dashboard?payment_callback=true`;

    const amountInKobo = applicationFee * 100;
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: application.email,
        amount: amountInKobo,
        currency: 'NGN',
        callback_url: callbackUrl,
        metadata: {
          applicationNumber: application.applicationNumber,
          purpose: 'ACE-SPED Application Fee',
          custom_fields: [
            {
              display_name: 'Application Number',
              variable_name: 'application_number',
              value: application.applicationNumber,
            },
            {
              display_name: 'Application Fee',
              variable_name: 'application_fee',
              value: 'Application Processing Fee',
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.status || !data?.data?.authorization_url) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || 'Failed to initialize payment.',
        },
        { status: response.ok ? 500 : response.status }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
      amount: applicationFee,
    });
  } catch (error) {
    console.error('Applicant payment initialize error:', error);
    return NextResponse.json(
      {
        success: false,
        message: getFriendlyErrorMessage(error, 'Unable to start payment. Please try again.'),
      },
      { status: 500 }
    );
  }
}
