import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
    try {
        // Get token from cookie
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Verify token
        let studentId: string;
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (!payload.isStudentTable) throw new Error('Not a student token');
            studentId = payload.studentId as string;
        } catch (err) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        if (!studentId) {
            return NextResponse.json(
                { success: false, message: 'Invalid token payload' },
                { status: 401 }
            );
        }

        const normalizeProgramType = (raw: string) => {
            const key = raw.trim().toUpperCase();
            if (key.includes('PHD') || key.includes('PH.D')) return 'PHD';
            if (key.includes('PGD')) return 'PGD';
            if (key.includes('MASTER') || key.includes('MSC') || key.includes('M.SC')) return 'MASTERS';
            return key;
        };

        const programTypeVariants = (normalized: string) => {
            // Values stored in `courses.programType` vary across environments (e.g. "MASTERS", "Masters", "MSc")
            switch (normalized) {
                case 'MASTERS':
                    return ['MASTERS', 'MSC', 'Masters', 'MSc', 'MASTER', 'masters', 'msc', 'm.sc'];
                case 'PHD':
                    return ['PHD', 'PhD', 'phd', 'PH.D', 'ph.d'];
                case 'PGD':
                    return ['PGD', 'pgd'];
                default:
                    return [normalized, normalized.toLowerCase()];
            }
        };

        // 1. Find the student (including Application.programType)
        const student = await prisma.student.findFirst({
            where: { id: studentId },
            select: { id: true, personalInfo: true, application: { select: { programType: true } } }
        });

        if (!student) {
            return NextResponse.json(
                { success: false, message: 'Student record not found' },
                { status: 404 }
            );
        }

        // 2. Find active program
        const studentProgram = await prisma.studentProgramme.findFirst({
            where: {
                studentId: student.id,
                status: { in: ['ADMITTED', 'REGISTERED', 'IN_PROGRESS'] }
            },
            include: {
                program: true
            }
        });

        if (!studentProgram) {
            return NextResponse.json(
                { success: false, message: 'No active program found for this student' },
                { status: 404 }
            );
        }

        // 3. Get active academic session and semester from system settings
        const [sessionRow, semesterRow] = await Promise.all([
            prisma.systemSetting.findUnique({
                where: { key: 'active_academic_session' },
                select: { value: true },
            }),
            prisma.systemSetting.findUnique({
                where: { key: 'active_semester' },
                select: { value: true },
            }),
        ]);
        const activeSession = sessionRow?.value ?? '2025/2026';
        const activeSemester = semesterRow?.value ?? 'First';

        // Program type from the student's Application table (requested)
        // Fallback to Program.level only if application programType is missing.
        const applicationProgramTypeRaw = student.application?.programType || '';
        const normalizedFromApplication = applicationProgramTypeRaw ? normalizeProgramType(applicationProgramTypeRaw) : '';
        const fallbackFromProgramLevel = String(studentProgram.program.level || '');
        const normalizedProgramType = normalizedFromApplication || normalizeProgramType(fallbackFromProgramLevel);
        const programTypeValues = [...new Set(programTypeVariants(normalizedProgramType))];

        // 4. Fetch courses for the program: current session/semester AND matching program type (or course.programType null)
        const courses = await prisma.course.findMany({
            where: {
                programId: studentProgram.programId,
                isActive: true,
                AND: [
                    {
                        OR: [
                            { semester: { equals: activeSemester, mode: 'insensitive' } },
                            { semester: null },
                        ],
                    },
                    {
                        OR: [
                            ...programTypeValues.map((v) => ({ programType: { equals: v, mode: 'insensitive' as const } })),
                            { programType: null },
                        ],
                    },
                ],
            },
            orderBy: {
                displayOrder: 'asc'
            }
        });

        // 5. Fetch registered courses for the active session
        const registrations = await (prisma as any).studentCourseRegistration.findMany({
            where: {
                studentId: student.id,
                session: activeSession
            }
        });

        return NextResponse.json({
            success: true,
            program: studentProgram.program,
            // Send the application programType (raw) to the UI for display,
            // and also send the normalized value (useful for debugging/consistency).
            programType: applicationProgramTypeRaw || normalizedProgramType,
            programTypeNormalized: normalizedProgramType,
            session: activeSession,
            semester: activeSemester,
            courses: courses,
            registeredCourseIds: registrations.map((r: any) => r.courseId),
            studentName: student.personalInfo
                ? `${student.personalInfo.firstname} ${student.personalInfo.surname}`
                : 'Student'
        });

    } catch (error: any) {
        console.error('Course registration data fetch error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred while fetching course registration data',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get token from cookie
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Verify token
        let studentId: string;
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (!payload.isStudentTable) throw new Error('Not a student token');
            studentId = payload.studentId as string;
        } catch (err) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { courseIds } = body;

        if (!Array.isArray(courseIds)) {
            return NextResponse.json(
                { success: false, message: 'Invalid request data' },
                { status: 400 }
            );
        }

        // Use active session from system settings
        const sessionRow = await prisma.systemSetting.findUnique({
            where: { key: 'active_academic_session' },
            select: { value: true },
        });
        const session = sessionRow?.value ?? '2025/2026';

        // 1. Find the student
        const student = await prisma.student.findFirst({
            where: { id: studentId },
            select: { id: true }
        });

        if (!student) {
            return NextResponse.json(
                { success: false, message: 'Student record not found' },
                { status: 404 }
            );
        }

        // 2. Transaction to update registrations
        // We will delete existing registrations for this session and create new ones
        // This handles both adding new courses and removing deselected ones

        await prisma.$transaction(async (tx) => {
            // Delete existing registrations for this session
            await (tx as any).studentCourseRegistration.deleteMany({
                where: {
                    studentId: student.id,
                    session: session
                }
            });

            // Create new registrations
            if (courseIds.length > 0) {
                // Fetch course details to get semester if needed, or just insert
                // We might need to fetch courses to get the semester. 
                // For now, let's assume we can get semester from the course or just use a placeholder/lookup if needed.
                // However, Schema says `semester` is a string field in `StudentCourseRegistration`.
                // We should probably fetch the courses being registered to get their semester.

                const courses = await tx.course.findMany({
                    where: { id: { in: courseIds } },
                    select: { id: true, semester: true }
                });

                const semesterRow = await prisma.systemSetting.findUnique({
                    where: { key: 'active_semester' },
                    select: { value: true },
                });
                const activeSemester = semesterRow?.value ?? 'First';

                const creationData = courses.map(course => ({
                    studentId: student.id,
                    courseId: course.id,
                    session: session,
                    semester: course.semester || activeSemester,
                    status: 'REGISTERED'
                }));

                await (tx as any).studentCourseRegistration.createMany({
                    data: creationData
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Course registration updated successfully'
        });

    } catch (error: any) {
        console.error('Course registration save error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred while saving course registration',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
