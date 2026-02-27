
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ courseId: string }> }
) {
    try {
        const params = await context.params;
        const { courseId } = params;
        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        // Verify lecturer is assigned to this course
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { lecturers: { select: { id: true } } }
        });

        if (!course || !course.lecturers.some(l => l.id === userId)) {
            return NextResponse.json({ success: false, message: 'Unauthorized or course not found' }, { status: 403 });
        }

        const registrations = await prisma.studentCourseRegistration.findMany({
            where: {
                courseId: courseId,
                status: 'REGISTERED'
            },
            include: {
                student: {
                    include: {
                        personalInfo: {
                            select: {
                                firstname: true,
                                surname: true,
                                email: true,
                                phoneNumber: true,
                                avatar: true,
                            }
                        },
                        application: {
                            select: {
                                firstname: true,
                                surname: true,
                                email: true,
                                phoneNumber: true,
                                avatar: true,
                            }
                        },
                        programmes: {
                            where: { status: 'ADMITTED' }, // simplistic
                            take: 1,
                            include: { program: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedStudents = registrations.map(reg => ({
            id: reg.student.id,
            registrationId: reg.id,
            fullName: `${reg.student.personalInfo?.firstname || reg.student.application?.firstname || ''} ${reg.student.personalInfo?.surname || reg.student.application?.surname || ''}`.trim(),
            matricNumber: reg.student.matricNumber,
            email: reg.student.personalInfo?.email || reg.student.application?.email,
            phoneNumber: reg.student.personalInfo?.phoneNumber || reg.student.application?.phoneNumber,
            avatar: reg.student.personalInfo?.avatar || reg.student.application?.avatar,
            program: reg.student.programmes[0]?.program.title || 'N/A',
            registeredAt: reg.createdAt
        }));

        return NextResponse.json({
            success: true,
            students: formattedStudents,
            courseTitle: course.title,
            courseCode: course.courseCode
        });

    } catch (error) {
        console.error('Error fetching course students:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch students' }, { status: 500 });
    }
}
