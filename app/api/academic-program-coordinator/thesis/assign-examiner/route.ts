import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: Request) {
    try {
        const token = (request as any).cookies?.get('auth-token')?.value || request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0];

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { studentProgrammeId, examinerId, type } = body;
        // type: 'internal1', 'internal2', 'external'

        if (!studentProgrammeId || !type) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        let updateData = {};
        if (type === 'internal1') {
            updateData = { internalExaminer1Id: examinerId || null };
        } else if (type === 'internal2') {
            updateData = { internalExaminer2Id: examinerId || null };
        } else if (type === 'external') {
            updateData = { externalExaminerId: examinerId || null };
        } else {
            return NextResponse.json(
                { success: false, message: 'Invalid examiner type' },
                { status: 400 }
            );
        }

        console.log(`Assigning ${type} examiner ${examinerId} to programme ${studentProgrammeId}`);

        // Update the StudentProgramme record
        // Cast to any to avoid TS errors if types are stale
        const updated = await (prisma.studentProgramme as any).update({
            where: { id: studentProgrammeId },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: 'Examiner assigned successfully'
        });

    } catch (error: any) {
        console.error('Error assigning examiner:', error);
        return NextResponse.json(
            { success: false, message: `Failed to assign examiner: ${error.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
