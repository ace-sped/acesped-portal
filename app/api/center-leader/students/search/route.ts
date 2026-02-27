
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

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ success: true, students: [] });
        }

        const students = await prisma.student.findMany({
            where: {
                OR: [
                    {
                        personalInfo: {
                            OR: [
                                { firstname: { contains: query, mode: 'insensitive' } },
                                { surname: { contains: query, mode: 'insensitive' } },
                                { middlename: { contains: query, mode: 'insensitive' } },
                            ]
                        }
                    },
                    { matricNumber: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                matricNumber: true,
                personalInfo: {
                    select: {
                        firstname: true,
                        surname: true,
                        middlename: true,
                        gender: true,
                        nationality: true,
                    }
                },
                programmes: {
                    where: { status: 'ADMITTED' }, // Or active
                    include: {
                        program: {
                            select: {
                                title: true,
                                level: true
                            }
                        }
                    },
                    take: 1
                }
            },
            take: 10
        });

        const formattedStudents = students.map(student => ({
            id: student.id,
            name: `${student.personalInfo?.surname || ''} ${student.personalInfo?.firstname || ''} ${student.personalInfo?.middlename || ''}`.trim(),
            matricNumber: student.matricNumber,
            program: student.programmes[0]?.program.title || 'N/A',
            gender: student.personalInfo?.gender
        }));

        return NextResponse.json({ success: true, students: formattedStudents });

    } catch (error) {
        console.error('Error searching students:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to search students' },
            { status: 500 }
        );
    }
}
