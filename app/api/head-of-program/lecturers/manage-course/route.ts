
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        // Verify authorized role
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
        const { lecturerId, courseId, action } = body;

        if (!lecturerId || !courseId || !action) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify that the course belongs to a program managed by this HoP
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                program: {
                    headOfProgramId: userId
                }
            }
        });

        if (!course) {
            return NextResponse.json(
                { success: false, message: 'You are not authorized to manage this course' },
                { status: 403 }
            );
        }

        if (action === 'ASSIGN') {
            await prisma.lecturer.update({
                where: { id: lecturerId },
                data: {
                    coursesTaught: {
                        connect: { id: courseId }
                    }
                }
            });
            return NextResponse.json({ success: true, message: 'Course assigned successfully' });
        } else if (action === 'REMOVE') {
            await prisma.lecturer.update({
                where: { id: lecturerId },
                data: {
                    coursesTaught: {
                        disconnect: { id: courseId }
                    }
                }
            });
            return NextResponse.json({ success: true, message: 'Course removed successfully' });
        }

        return NextResponse.json(
            { success: false, message: 'Invalid action' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Error managing course assignment:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to manage course assignment' },
            { status: 500 }
        );
    }
}
