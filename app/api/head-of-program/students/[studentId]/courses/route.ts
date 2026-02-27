
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ studentId: string }> }
) {
    try {
        const params = await context.params;
        const { studentId } = params;
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        // Verify HoP role
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

        // Get student's program info to filter courses
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                programmes: {
                    where: { status: 'ADMITTED' }, // Or active status
                    include: { program: true }
                },
                registrations: {
                    include: { course: true }
                }
            }
        });

        if (!student || student.programmes.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Student or active program not found' },
                { status: 404 }
            );
        }

        const programId = student.programmes[0].programId;

        // Fetch all courses for this program
        const availableCourses = await prisma.course.findMany({
            where: {
                programId: programId,
                isActive: true
            },
            orderBy: {
                title: 'asc'
            }
        });

        // Map courses and mark if registered
        const courses = availableCourses.map(course => {
            const registration = student.registrations.find(r => r.courseId === course.id);
            return {
                id: course.id,
                title: course.title,
                courseCode: course.courseCode,
                creditHours: course.creditHours,
                isRegistered: !!registration,
                registrationStatus: registration?.status || null
            };
        });

        return NextResponse.json({
            success: true,
            courses
        });

    } catch (error) {
        console.error('Error fetching student courses:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ studentId: string }> }
) {
    try {
        const params = await context.params;
        const { studentId } = params;
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        // Verify HoP role
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

        const body = await request.json();
        const { courseId, action } = body; // action: 'add' or 'drop'

        if (!courseId || !action) {
            return NextResponse.json(
                { success: false, message: 'Missing courseId or action' },
                { status: 400 }
            );
        }

        if (action === 'add') {
            // Check if already registered
            const existing = await prisma.studentCourseRegistration.findFirst({
                where: {
                    studentId,
                    courseId
                }
            });

            if (existing) {
                // If previously dropped/inactive, reactivate? Or just return success
                if (existing.status !== 'REGISTERED') {
                    await prisma.studentCourseRegistration.update({
                        where: { id: existing.id },
                        data: { status: 'REGISTERED' }
                    });
                }
                return NextResponse.json({ success: true, message: 'Course added' });
            }

            // Determine session/semester - get from course or current session
            // Ideally we should get this from input or system settings. 
            // for now, we'll try to get it from the student's program admission or default.
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                include: { programmes: true }
            });
            const session = student?.programmes[0]?.admissionSession || '2023/2024'; // Fallback
            const semester = 'First'; // Fallback or dynamic

            await prisma.studentCourseRegistration.create({
                data: {
                    studentId,
                    courseId,
                    session,
                    semester,
                    status: 'REGISTERED'
                }
            });

            return NextResponse.json({ success: true, message: 'Course registered successfully' });

        } else if (action === 'drop') {
            // Find registration
            const registration = await prisma.studentCourseRegistration.findFirst({
                where: {
                    studentId,
                    courseId
                }
            });

            if (!registration) {
                return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
            }

            // Hard delete or soft delete? User said "drop". Usually means removing.
            await prisma.studentCourseRegistration.delete({
                where: { id: registration.id }
            });

            return NextResponse.json({ success: true, message: 'Course dropped successfully' });
        }

        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error managing student course:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update course registration' },
            { status: 500 }
        );
    }
}
