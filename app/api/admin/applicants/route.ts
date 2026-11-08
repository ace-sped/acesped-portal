import { NextRequest, NextResponse } from 'next/server';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendAdmissionApprovedEmail } from '@/lib/email';

// GET all postgraduate applications (main Application model)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication/authorization for admin roles
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');


    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstname: { contains: search, mode: 'insensitive' as any } },
        { surname: { contains: search, mode: 'insensitive' as any } },
        { email: { contains: search, mode: 'insensitive' as any } },
        { phoneNumber: { contains: search, mode: 'insensitive' as any } },
        { applicationNumber: { contains: search, mode: 'insensitive' as any } },
        { programChoice: { contains: search, mode: 'insensitive' as any } },
      ];
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to fetch applicant from database, please check your internet network and try again.' },
      { status: 500 }
    );
  }
}

// PATCH update a single application (status and/or payment reference)
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Add authentication/authorization checks
    const body = await request.json();
    const { id, status } = body;
    const hasPaymentReferenceUpdate = Object.prototype.hasOwnProperty.call(
      body,
      'paymentReference'
    );
    const paymentReference = hasPaymentReferenceUpdate
      ? typeof body.paymentReference === 'string'
        ? body.paymentReference.trim()
        : ''
      : undefined;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Application id is required' },
        { status: 400 }
      );
    }

    if (!status && !hasPaymentReferenceUpdate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Provide status and/or paymentReference to update.',
        },
        { status: 400 }
      );
    }

    const validStatuses: ApplicationStatus[] = [
      ApplicationStatus.PENDING,
      ApplicationStatus.UNDER_REVIEW,
      ApplicationStatus.APPROVED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.AWAITING_PAYMENT,
    ];
    let nextStatusValue: ApplicationStatus | undefined;

    if (status) {
      if (!validStatuses.includes(status as ApplicationStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          },
          { status: 400 }
        );
      }
      nextStatusValue = status as ApplicationStatus;
    }

    // Fetch existing application to detect status change
    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    let applicationNumber = existing.applicationNumber;
    const nextStatus = nextStatusValue || existing.status;

    // Auto-generate application number if approving and it doesn't exist
    if (nextStatusValue === ApplicationStatus.APPROVED && !applicationNumber) {
      const year = new Date().getFullYear();
      const count = await prisma.application.count({
        where: {
          applicationNumber: { startsWith: `ACE/${year}/` },
        },
      });
      const sequence = (count + 1).toString().padStart(4, '0');
      applicationNumber = `ACE/${year}/${sequence}`;

      const check = await prisma.application.findUnique({
        where: { applicationNumber },
      });
      if (check) {
        applicationNumber = `ACE/${year}/${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0')}`;
      }
    }

    const data: Prisma.ApplicationUpdateInput = {};

    if (nextStatusValue) {
      data.status = nextStatusValue;
      data.applicationNumber = applicationNumber;
    }

    if (hasPaymentReferenceUpdate) {
      data.paymentReference = paymentReference || '';
      if (paymentReference) {
        data.paymentMethod = existing.paymentMethod || 'Paystack';
      }
    }

    const updated = await prisma.application.update({
      where: { id },
      data,
    });

    // If status changed from non-approved to APPROVED, send congratulatory email
    if (
      existing.status !== ApplicationStatus.APPROVED &&
      nextStatus === ApplicationStatus.APPROVED &&
      nextStatusValue
    ) {
      try {
        console.log('Attemping to send admission approval email to:', updated.email);
        await sendAdmissionApprovedEmail({
          email: updated.email,
          firstname: updated.firstname,
          surname: updated.surname,
          programChoice: updated.programChoice,
          admissionSession: updated.admissionSession,
          applicationNumber: updated.applicationNumber,
        });
        console.log('Admission approval email process completed.');
      } catch (emailError) {
        console.error('Failed to send admission email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      application: updated,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// DELETE an application
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Application id is required' },
        { status: 400 }
      );
    }

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
