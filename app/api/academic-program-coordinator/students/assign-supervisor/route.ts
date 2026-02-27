import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: Request) {
    try {
        const token = (request as any).cookies?.get('auth-token')?.value || request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0];

        // Basic auth check - in production middleware handles this mostly, but good to double check
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { studentProgrammeId, supervisorId } = body;

        if (!studentProgrammeId || !supervisorId) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        console.log(`Assigning supervisor ${supervisorId} to programme ${studentProgrammeId}`);

        // Update the StudentProgramme record
        const updated = await prisma.studentProgramme.update({
            where: { id: studentProgrammeId },
            data: {
                supervisorId: supervisorId
            },
            include: {
                supervisor: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Supervisor assigned successfully',
            supervisor: updated.supervisor
        });

    } catch (error: any) {
        console.error('Error assigning supervisor details:', error);

        // Handle specific Prisma errors if needed
        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, message: 'Student program record not found' },
                { status: 404 }
            );
        }

        if (error.code === 'P2003') {
            return NextResponse.json(
                { success: false, message: 'Invalid supervisor ID' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: `Failed to assign supervisor: ${error.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
