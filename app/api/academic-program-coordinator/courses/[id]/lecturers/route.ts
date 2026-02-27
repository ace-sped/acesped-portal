
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Assign lecturer to course
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseId } = await params;
        const body = await request.json();
        const { lecturerId } = body;

        if (!lecturerId) {
            return NextResponse.json(
                { success: false, message: 'Lecturer ID is required' },
                { status: 400 }
            );
        }

        // Connect lecturer to course
        const updatedCourse = await prisma.course.update({
            where: { id: courseId },
            data: {
                lecturers: {
                    connect: { id: lecturerId }
                }
            },
            include: {
                lecturers: true
            }
        });

        return NextResponse.json({
            success: true,
            course: updatedCourse,
            message: 'Lecturer assigned successfully'
        });
    } catch (error) {
        console.error('Error assigning lecturer:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to assign lecturer' },
            { status: 500 }
        );
    }
}

// Remove lecturer from course
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseId } = await params;
        const { searchParams } = new URL(request.url);
        const lecturerId = searchParams.get('lecturerId');

        if (!lecturerId) {
            return NextResponse.json(
                { success: false, message: 'Lecturer ID is required' },
                { status: 400 }
            );
        }

        // Disconnect lecturer from course
        const updatedCourse = await prisma.course.update({
            where: { id: courseId },
            data: {
                lecturers: {
                    disconnect: { id: lecturerId }
                }
            },
            include: {
                lecturers: true
            }
        });

        return NextResponse.json({
            success: true,
            course: updatedCourse,
            message: 'Lecturer removed successfully'
        });
    } catch (error) {
        console.error('Error removing lecturer:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to remove lecturer' },
            { status: 500 }
        );
    }
}
