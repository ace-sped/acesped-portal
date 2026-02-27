import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // In a real app, strict auth checks here

        // Fetch students with all relevant relations
        const students = await prisma.student.findMany({
            where: {
                status: 'ACTIVE' // Filter by active as per requirement? Or show all and filter on frontend?
                // Let's fetch all and filter on frontend to be flexible, or just active if requested.
                // Prompt says "View active students". I'll default to all but maybe filter in query.
            },
            include: {
                personalInfo: true,
                application: {
                    select: {
                        email: true,
                        firstname: true,
                        surname: true,
                        phoneNumber: true,
                        avatar: true,
                    }
                },
                programmes: {
                    where: {
                        status: 'ADMITTED' // or IN_PROGRESS
                    },
                    include: {
                        program: {
                            select: {
                                id: true,
                                title: true,
                                courseCode: true,
                            }
                        },
                        supervisor: {
                            select: {
                                id: true,
                                firstname: true,
                                surname: true,
                                email: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                registrations: {
                    where: {
                        status: 'REGISTERED' // Counting active courses
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedStudents = students.map((student: any) => {
            // Determine primary program (most recent active one)
            const currentProgram = student.programmes?.[0];
            const email = student.personalInfo?.email || student.application?.email || '';
            const fullName =
                student.personalInfo
                    ? `${student.personalInfo.firstname} ${student.personalInfo.surname}`
                    : student.application
                        ? `${student.application.firstname || ''} ${student.application.surname || ''}`.trim() || 'Unknown'
                        : 'Unknown';
            const phoneNumber = student.personalInfo?.phoneNumber || student.application?.phoneNumber || '';

            return {
                id: student.id,
                matricNumber: student.matricNumber || 'N/A',
                fullName,
                email,
                phoneNumber,
                program: currentProgram?.program?.title || 'No Program',
                programId: currentProgram?.program?.id,
                programCode: currentProgram?.program?.courseCode,
                currentLevel: 'N/A', // Could be derived if needed
                status: student.status,
                supervisor: currentProgram?.supervisor
                    ? `${currentProgram.supervisor.firstname} ${currentProgram.supervisor.surname}`
                    : null,
                supervisorId: currentProgram?.supervisorId || null,
                activeCoursesCount: student.registrations?.length || 0,
                studentProgrammeId: currentProgram?.id // Needed for updating supervisor
            };
        });

        return NextResponse.json({ success: true, students: formattedStudents });

    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch students' },
            { status: 500 }
        );
    }
}
