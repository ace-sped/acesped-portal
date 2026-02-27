
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Unified param name
) {
    try {
        const params = await context.params;
        const { id: courseId } = params; // Map 'id' to 'courseId' variable
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        // Verify HoP has access to this course (via Program)
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { program: true }
        });

        if (!course || course.program.headOfProgramId !== userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized access to this course' },
                { status: 403 }
            );
        }

        const materials = await prisma.courseMaterial.findMany({
            where: { courseId },
            orderBy: { uploadedAt: 'desc' }
        });

        const results = await prisma.resultSubmission.findMany({
            where: { courseId },
            orderBy: { submittedAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            materials,
            results
        });

    } catch (error) {
        console.error('Error fetching course materials:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch materials' },
            { status: 500 }
        );
    }
}
