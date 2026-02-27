
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
        const courseId = searchParams.get('courseId');
        const session = searchParams.get('session');

        // Build filter
        const where: any = {
            course: {
                program: {
                    headOfProgramId: userId // Ensure HoP only sees their program results
                }
            },
            // Only fetch records that have results
            OR: [
                { score: { not: null } },
                { grade: { not: null } }
            ]
        };

        if (programId && programId !== 'ALL') {
            where.course.programId = programId;
        }

        if (courseId && courseId !== 'ALL') {
            where.courseId = courseId;
        }

        if (session && session !== 'ALL') {
            where.session = session;
        }

        const results = await prisma.studentCourseRegistration.findMany({
            where,
            include: {
                student: {
                    include: {
                        personalInfo: {
                            select: {
                                firstname: true,
                                surname: true,
                                email: true
                            }
                        },
                        application: {
                            select: {
                                firstname: true,
                                surname: true,
                                email: true
                            }
                        }
                    }
                },
                course: {
                    select: {
                        title: true,
                        courseCode: true,
                        program: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                student: {
                    matricNumber: 'asc'
                }
            }
        });

        // Let's clean up the sort. Since sorting by relation field might be tricky without correct schema knowledge, 
        // let's sort in JS or use creation date.
        // Actually Student model has userId, applicationId, etc. It usually relies on linked User for names.
        // StudentPersonalInfo has firstname/surname.

        const formattedResults = results.map(r => ({
            id: r.id,
            studentName: r.student.personalInfo
                ? `${r.student.personalInfo.firstname} ${r.student.personalInfo.surname}`
                : r.student.application
                    ? `${r.student.application.firstname} ${r.student.application.surname}`
                    : 'Unknown Student',
            matricNumber: r.student.matricNumber || 'N/A',
            courseTitle: r.course.title,
            courseCode: r.course.courseCode,
            programTitle: r.course.program.title,
            score: r.score,
            grade: r.grade,
            session: r.session,
            semester: r.semester
        }));

        return NextResponse.json({
            success: true,
            results: formattedResults
        });

    } catch (error) {
        console.error('Error fetching results:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}
