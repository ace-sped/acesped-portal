
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const lecturerId = searchParams.get('lecturerId');

        const where: any = {};
        if (status && status !== 'ALL') where.status = status;
        if (lecturerId) where.lecturerId = lecturerId;

        // Use "any" cast to avoid build errors if types are stale
        const payments = await (prisma as any).lecturerPayment.findMany({
            where,
            include: {
                lecturer: {
                    select: {
                        id: true,
                        firstname: true,
                        surname: true,
                        email: true,
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        courseCode: true,
                        creditHours: true,
                    }
                }
            },
            orderBy: { generatedAt: 'desc' }
        });

        return NextResponse.json(payments);
    } catch (error) {
        console.error('Error fetching lecturer payments:', error);
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, paymentIds } = body;

        if (action === 'APPROVE') {
            await (prisma as any).lecturerPayment.updateMany({
                where: { id: { in: paymentIds } },
                data: { status: 'APPROVED' }
            });
        } else if (action === 'PAY') {
            await (prisma as any).lecturerPayment.updateMany({
                where: { id: { in: paymentIds } },
                data: { status: 'PAID', paidAt: new Date() }
            });
        } else if (action === 'GENERATE') {
            // Logic to generate payments for all lecturers with courses
            // For simplicity, we'll find all courses with lecturers and create a pending payment if one doesn't exist for this month/session
            // This is a simplified "Generate Schedule" logic

            // Fetch users who are lecturers and have courses
            // Fetch lecturers with courses
            const lecturers = await prisma.lecturer.findMany({
                where: {
                    coursesTaught: { some: {} }
                },
                include: {
                    coursesTaught: true
                }
            });

            const newPayments = [];

            for (const lecturer of lecturers) {
                for (const course of lecturer.coursesTaught) {
                    // Check if payment already exists for this course/lecturer (simplified check)
                    // In a real app, we'd check against a specific session/semester or month
                    const existingPayment = await (prisma as any).lecturerPayment.findFirst({
                        where: {
                            lecturerId: lecturer.id,
                            courseId: course.id,
                            status: { not: 'REJECTED' } // Don't duplicate unless rejected?
                        }
                    });

                    if (!existingPayment) {
                        // Calculate amount: e.g. 50000 per credit unit
                        const creditHours = course.creditHours || 2; // Default to 2 if not set
                        const amount = creditHours * 50000;

                        newPayments.push({
                            lecturerId: lecturer.id,
                            courseId: course.id,
                            amount: amount,
                            status: 'PENDING',
                            currency: 'NGN'
                        });
                    }
                }
            }

            if (newPayments.length > 0) {
                await (prisma as any).lecturerPayment.createMany({
                    data: newPayments
                });
            }

            return NextResponse.json({ message: `Generated ${newPayments.length} new payments` });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing payments:', error);
        return NextResponse.json({ error: 'Failed to process payments' }, { status: 500 });
    }
}
