
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseId } = await params;
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        // Verify role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user || user.role !== 'Head_of_Program') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Verify course belongs to HOP's program
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                program: true
            }
        });

        if (!course || course.program.headOfProgramId !== userId) {
            return NextResponse.json(
                { success: false, message: 'Course not found or unauthorized' },
                { status: 404 }
            );
        }

        // Fetch registered students
        const registrations = await prisma.studentCourseRegistration.findMany({
            where: {
                courseId: courseId,
                status: 'REGISTERED' // Only active registrations?
            },
            include: {
                student: {
                    include: {
                        personalInfo: {
                            select: {
                                firstname: true,
                                surname: true,
                                email: true,
                                avatar: true,
                                phoneNumber: true // Note: Check schema if 'phonenumber' or 'phoneNumber'. 
                                // Schema says StudentPersonalInfo has phoneNumber.
                            }
                        },
                        application: {
                            select: {
                                firstname: true,
                                surname: true,
                                email: true,
                                avatar: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                student: {
                    matricNumber: 'asc'
                }
            }
        });

        const students = registrations.map(reg => {
            const student = reg.student;
            // Use PersonalInfo if available, else Application
            const info = student.personalInfo || student.application;

            return {
                id: student.id,
                matricNumber: student.matricNumber,
                firstname: info?.firstname,
                surname: info?.surname,
                email: info?.email,
                avatar: info?.avatar,
                registrationDate: reg.createdAt
            };
        });

        return NextResponse.json({
            success: true,
            students
        });

    } catch (error) {
        console.error('Error fetching course students:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch students' },
            { status: 500 }
        );
    }
}
