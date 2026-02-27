
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // TODO: Authorization check for Academic Program Coordinator

        const { searchParams } = new URL(request.url);
        const programId = searchParams.get('programId');
        const search = searchParams.get('search');

        const where: any = {};

        if (programId && programId !== 'all') {
            where.programId = programId;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { courseCode: { contains: search, mode: 'insensitive' } },
            ];
        }

        const courses = await prisma.course.findMany({
            where,
            include: {
                program: {
                    select: { id: true, title: true, courseCode: true }
                },
                lecturers: {
                    select: {
                        id: true,
                        firstname: true,
                        surname: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
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
