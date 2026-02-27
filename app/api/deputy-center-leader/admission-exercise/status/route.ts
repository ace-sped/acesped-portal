import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdmissionApprovedEmail } from '@/lib/email';

/** Minimum total score required to approve an applicant (must match frontend). */
const MIN_SCORE_TO_APPROVE = 50;

/**
 * PATCH - Update application status (Approve or Reject) by application number.
 * Used by deputy-center-leader from the admission exercise table.
 * Approve is only allowed when the applicant's admission exercise total score >= MIN_SCORE_TO_APPROVE.
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { applicationNumber, status } = body;

        if (!applicationNumber || !status) {
            return NextResponse.json(
                { success: false, message: 'applicationNumber and status are required' },
                { status: 400 }
            );
        }

        const validStatuses = ['APPROVED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, message: 'status must be APPROVED or REJECTED' },
                { status: 400 }
            );
        }

        const existing = await prisma.application.findUnique({
            where: { applicationNumber },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, message: 'Application not found' },
                { status: 404 }
            );
        }

        if (status === 'APPROVED') {
            const exercise = await prisma.admissionExercise.findFirst({
                where: { applicationNumber },
            });
            const total = exercise?.total ?? 0;
            if (total < MIN_SCORE_TO_APPROVE) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Score too low to approve. Minimum total score of ${MIN_SCORE_TO_APPROVE} required (current: ${total}).`,
                    },
                    { status: 400 }
                );
            }
        }

        const updated = await prisma.application.update({
            where: { id: existing.id },
            data: { status },
        });

        if (existing.status !== 'APPROVED' && status === 'APPROVED') {
            try {
                await sendAdmissionApprovedEmail({
                    email: updated.email,
                    firstname: updated.firstname,
                    surname: updated.surname,
                    programChoice: updated.programChoice,
                    admissionSession: updated.admissionSession,
                    applicationNumber: updated.applicationNumber,
                });
            } catch (emailError) {
                console.error('Failed to send admission approval email', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            application: updated,
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update application status' },
            { status: 500 }
        );
    }
}
