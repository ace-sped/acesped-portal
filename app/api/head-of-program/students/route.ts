
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

        // Find students enrolled in programs managed by this Head of Program
        const students = await prisma.studentProgramme.findMany({
            where: {
                program: {
                    headOfProgramId: userId
                }
            },
            include: {
                student: {
                    include: {
                        application: {
                            select: {
                                email: true,
                                firstname: true,
                                surname: true,
                                phoneNumber: true,
                                avatar: true,
                            }
                        },
                        personalInfo: {
                            select: {
                                firstname: true,
                                surname: true,
                                email: true,
                                phoneNumber: true,
                                avatar: true,
                                gender: true,
                                state: true,
                                nationality: true
                            }
                        },
                        registrations: {
                            where: {
                                status: 'REGISTERED'
                            }
                        }
                    }
                },
                program: {
                    select: {
                        id: true,
                        title: true,
                        level: true,
                        courseCode: true
                    }
                },
                supervisor: {
                    select: {
                        id: true,
                        firstname: true,
                        surname: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Flatten the structure for easier consumption
        const formattedStudents = students.map(sp => ({
            id: sp.student.id,
            matricNumber: sp.student.matricNumber,
            registrationNumber: sp.student.registrationNumber,
            firstName: sp.student.personalInfo?.firstname || sp.student.application?.firstname,
            surname: sp.student.personalInfo?.surname || sp.student.application?.surname,
            fullName: `${sp.student.personalInfo?.firstname || sp.student.application?.firstname || ''} ${sp.student.personalInfo?.surname || sp.student.application?.surname || ''}`.trim(),
            email: sp.student.personalInfo?.email || sp.student.application?.email,
            phoneNumber: sp.student.personalInfo?.phoneNumber || sp.student.application?.phoneNumber,
            avatar: sp.student.personalInfo?.avatar || sp.student.application?.avatar,
            gender: sp.student.personalInfo?.gender,
            state: sp.student.personalInfo?.state,
            nationality: sp.student.personalInfo?.nationality,
            program: sp.program.title,
            programId: sp.program.id,
            programCode: sp.program.courseCode,
            level: sp.program.level,
            admissionSession: sp.admissionSession,
            modeOfStudy: sp.modeOfStudy,
            status: sp.status,
            enrolledAt: sp.createdAt,
            supervisor: sp.supervisor ? `${sp.supervisor.firstname} ${sp.supervisor.surname}` : null,
            supervisorId: sp.supervisor?.id || null,
            activeCoursesCount: sp.student.registrations.length,
            studentProgrammeId: sp.id
        }));

        return NextResponse.json({
            success: true,
            students: formattedStudents
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch students' },
            { status: 500 }
        );
    }
}
