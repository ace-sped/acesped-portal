import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendApplicationReceivedEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, admissionSession, ...rest } = data ?? {};
    const normalizedEmail = typeof email === 'string' ? email.trim() : '';
    const normalizedSession = typeof admissionSession === 'string' ? admissionSession.trim() : '';

    if (!normalizedEmail || !normalizedSession) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and admission session are required.',
        },
        { status: 400 }
      );
    }

    // Prevent duplicates: an email can only apply once per admission session
    const existingApplication = await prisma.application.findFirst({
      where: {
        email: normalizedEmail,
        admissionSession: normalizedSession,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          success: false,
          message:
            'You have already submitted an application for this admission session. Please contact support if you need to make changes.',
          applicationNumber: existingApplication.applicationNumber,
        },
        { status: 409 }
      );
    }

    // Generate a unique application number
    const applicationNumber = `ACE${new Date().getFullYear()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create the application in the database
    const application = await prisma.application.create({
      data: {
        ...rest,
        email: normalizedEmail,
        admissionSession: normalizedSession,
        applicationNumber,
        status: 'PENDING',
      },
    });

    // Send confirmation email
    try {
      console.log('Attempting to send application received email to:', application.email);
      await sendApplicationReceivedEmail({
        email: application.email,
        firstname: application.firstname,
        surname: application.surname,
        programChoice: application.programChoice,
        admissionSession: application.admissionSession,
        applicationNumber: applicationNumber,
      });
      console.log('Application received email process completed.');
    } catch (emailError) {
      console.error('Failed to send application received email:', emailError);
      // Continue execution, do not fail
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationNumber: application.applicationNumber,
      applicationId: application.id,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit application',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

