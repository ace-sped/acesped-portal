
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

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

        // Verify token
        try {
            await jwtVerify(token, JWT_SECRET);
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        // TODO: Add Center_Leader role check logic if needed (usually implicit via middleware or handled here)

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        const where: any = {
            status: 'ACTIVE' // Default filter, maybe? Or allow all.
        };

        if (search) {
            where.OR = [
                { matricNumber: { contains: search, mode: 'insensitive' } },
                {
                    personalInfo: {
                        OR: [
                            { firstname: { contains: search, mode: 'insensitive' } },
                            { surname: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                        ]
                    }
                }
            ];
        }

        const [students, total] = await prisma.$transaction([
            prisma.student.findMany({
                where,
                include: {
                    personalInfo: true,
                    application: {
                        select: {
                            email: true,
                            firstname: true,
                            surname: true,
                        }
                    },
                    programmes: {
                        where: { status: 'ADMITTED' },
                        include: {
                            program: true
                        },
                        take: 1
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.student.count({ where })
        ]);

        const formattedStudents = students.map(student => ({
            id: student.id,
            matricNumber: student.matricNumber,
            name: `${student.personalInfo?.surname || ''} ${student.personalInfo?.firstname || ''}`.trim(),
            email: student.personalInfo?.email || student.application?.email,
            program: student.programmes[0]?.program.title || 'N/A',
            level: student.programmes[0]?.program.level || 'N/A',
            status: student.status
        }));

        return NextResponse.json({
            success: true,
            students: formattedStudents,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page,
                limit
            }
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch students' },
            { status: 500 }
        );
    }
}
