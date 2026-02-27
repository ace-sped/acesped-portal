import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Verify JWT token
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        // Verify user role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!user || user.role !== 'Head_of_Program') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Fetch programs managed by this user
        const programs = await prisma.program.findMany({
            where: {
                headOfProgramId: userId,
                isActive: true,
            },
            include: {
                courses: {
                    orderBy: {
                        displayOrder: 'asc',
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            programs,
        });
    } catch (error) {
        console.error('Error fetching program data:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch program data' },
            { status: 500 }
        );
    }
}
