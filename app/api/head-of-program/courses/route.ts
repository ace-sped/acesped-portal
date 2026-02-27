
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

        const { searchParams } = new URL(request.url);
        const programId = searchParams.get('programId');

        const whereClause: any = {
            program: {
                headOfProgramId: userId
            }
        };

        if (programId) {
            whereClause.programId = programId;
        }

        const courses = await prisma.course.findMany({
            where: whereClause,
            include: {
                program: {
                    select: {
                        id: true,
                        title: true,
                        courseCode: true
                    }
                },
                lecturers: {
                    select: {
                        id: true,
                        firstname: true,
                        surname: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        registrations: true
                    }
                }
            },
            orderBy: {
                title: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            courses
        });

    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}
