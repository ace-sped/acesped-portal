
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        try {
            await jwtVerify(token, JWT_SECRET);
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                personalInfo: true,
                programmes: {
                    where: { status: 'ADMITTED' },
                    include: {
                        program: true
                    }
                },
                registrations: {
                    include: {
                        course: true
                    },
                    orderBy: [
                        { session: 'asc' },
                        { semester: 'asc' }
                    ]
                }
            }
        });

        if (!student) {
            return NextResponse.json(
                { success: false, message: 'Student not found' },
                { status: 404 }
            );
        }

        // Process results
        const results = student.registrations.map(reg => ({
            courseCode: reg.course.courseCode || 'N/A',
            courseTitle: reg.course.title,
            unit: reg.course.creditHours || 0,
            grade: reg.grade || 'N/A',
            score: reg.score || 0,
            session: reg.session,
            semester: reg.semester
        }));

        // Group by Session
        const resultsBySession: any = {};
        results.forEach(result => {
            if (!resultsBySession[result.session]) {
                resultsBySession[result.session] = {};
            }
            if (!resultsBySession[result.session][result.semester]) {
                resultsBySession[result.session][result.semester] = [];
            }
            resultsBySession[result.session][result.semester].push(result);
        });

        // Calculate CGPA (Simplified logic - assumes 5.0 scale)
        let totalPoints = 0;
        let totalunits = 0;

        const getPoints = (grade: string) => {
            switch (grade) {
                case 'A': return 5;
                case 'B': return 4;
                case 'C': return 3;
                case 'D': return 2;
                case 'E': return 1;
                case 'F': return 0;
                default: return 0;
            }
        };

        results.forEach(r => {
            if (r.grade !== 'N/A') {
                totalPoints += getPoints(r.grade) * r.unit;
                totalunits += r.unit;
            }
        });

        const cgpa = totalunits > 0 ? (totalPoints / totalunits).toFixed(2) : '0.00';

        return NextResponse.json({
            success: true,
            data: {
                student: {
                    name: `${student.personalInfo?.surname} ${student.personalInfo?.firstname} ${student.personalInfo?.middlename || ''}`.trim(),
                    matricNumber: student.matricNumber,
                    program: student.programmes[0]?.program.title || 'N/A',
                    gender: student.personalInfo?.gender,
                    cgpa: cgpa,
                    passport: student.personalInfo?.avatar // if available
                },
                results: resultsBySession
            }
        });

    } catch (error) {
        console.error('Error fetching student results:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}
