
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const courses = await prisma.course.findMany({
            where: {
                lecturers: {
                    some: { id: userId }
                },
                isActive: true
            },
            include: {
                program: {
                    select: {
                        title: true,
                        courseCode: true,
                        level: true
                    }
                },
                _count: {
                    select: {
                        registrations: { where: { status: 'REGISTERED' } },
                        materials: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedCourses = courses.map(course => ({
            id: course.id,
            title: course.title,
            courseCode: course.courseCode,
            program: course.program.title,
            programCode: course.program.courseCode,
            level: course.program.level,
            creditHours: course.creditHours,
            semester: course.semester,
            studentsCount: course._count.registrations,
            materialsCount: course._count.materials
        }));

        return NextResponse.json({
            success: true,
            courses: formattedCourses
        });

    } catch (error) {
        console.error('Error fetching lecturer courses:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch courses' }, { status: 500 });
    }
}
