import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdmissionExerciseInviteEmail } from '@/lib/email';

/** Get the date that is `workingDays` working days from `fromDate` (excludes Sat/Sun). */
function addWorkingDays(fromDate: Date, workingDays: number): Date {
  const result = new Date(fromDate);
  let added = 0;
  while (added < workingDays) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

/**
 * POST - Send admission exercise invite email to applicant.
 * Called when deputy center leader clicks "Invite for Admission Exercise" in application details modal.
 * Exercise date in the email is set to 14 working days from the invite date.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: 'applicationId is required' },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    const inviteDate = new Date();
    const exerciseDate = addWorkingDays(inviteDate, 14);

    await sendAdmissionExerciseInviteEmail({
      email: application.email,
      firstname: application.firstname,
      surname: application.surname,
      programChoice: application.programChoice,
      admissionSession: application.admissionSession,
      applicationNumber: application.applicationNumber,
      exerciseDate,
    });

    return NextResponse.json({
      success: true,
      message: 'Invite email sent to applicant',
    });
  } catch (error) {
    console.error('Error sending admission exercise invite:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to send invite email',
      },
      { status: 500 }
    );
  }
}
