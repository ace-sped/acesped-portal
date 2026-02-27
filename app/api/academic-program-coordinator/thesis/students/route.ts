import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const programFilter = searchParams.get('program');

        const where: any = {
            status: 'ACTIVE'
        };

        if (programFilter && programFilter !== 'ALL') {
            where.programmes = {
                some: {
                    program: {
                        title: {
                            equals: programFilter,
                            mode: 'insensitive'
                        }
                    },
                    status: 'ADMITTED'
                }
            };
        }

        // Fetch students for Thesis view (includes examiners)
        // We use 'any' cast on include object if TS complains about missing fields due to stale client
        const students = await prisma.student.findMany({
            where,
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
                        status: 'ADMITTED'
                    },
                    include: {
                        program: {
                            select: {
                                id: true,
                                title: true,
                                courseCode: true,
                            }
                        },
                        // Connect to newly added fields. 
                        // Note: If server hasn't been restarted, these might cause runtime errors.
                        // We'll proceed assuming user will restart.
                        supervisor: {
                            select: { id: true, firstname: true, surname: true }
                        },
                        internalExaminer1: {
                            select: { id: true, firstname: true, surname: true }
                        },
                        internalExaminer2: {
                            select: { id: true, firstname: true, surname: true }
                        },
                        externalExaminer: {
                            select: { id: true, firstname: true, surname: true }
                        }
                    } as any, // Cast to any to bypass stale TS types
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedStudents = students.map((student: any) => {
            const currentProgram = student.programmes?.[0];

            // Safe access with optional chaining in case fields aren't loaded
            const p = currentProgram as any;
            const fullName =
                student.personalInfo
                    ? `${student.personalInfo.firstname} ${student.personalInfo.surname}`
                    : student.application
                        ? `${student.application.firstname || ''} ${student.application.surname || ''}`.trim() || 'Unknown'
                        : 'Unknown';

            return {
                id: student.id,
                matricNumber: student.matricNumber || 'N/A',
                fullName,
                program: currentProgram?.program?.title || 'No Program',
                programId: currentProgram?.program?.id,
                studentProgrammeId: currentProgram?.id,

                supervisor: currentProgram?.supervisor
                    ? `${currentProgram.supervisor.firstname} ${currentProgram.supervisor.surname}`
                    : null,

                internalExaminer1: p?.internalExaminer1
                    ? `${p.internalExaminer1.firstname} ${p.internalExaminer1.surname}`
                    : null,
                internalExaminer1Id: p?.internalExaminer1Id,

                internalExaminer2: p?.internalExaminer2
                    ? `${p.internalExaminer2.firstname} ${p.internalExaminer2.surname}`
                    : null,
                internalExaminer2Id: p?.internalExaminer2Id,

                externalExaminer: p?.externalExaminer
                    ? `${p.externalExaminer.firstname} ${p.externalExaminer.surname}`
                    : null,
                externalExaminerId: p?.externalExaminerId,
            };
        });

        return NextResponse.json({ success: true, students: formattedStudents });

    } catch (error: any) {
        console.error('Error fetching thesis students:', error);
        return NextResponse.json(
            { success: false, message: `Failed to fetch students: ${error.message}` },
            { status: 500 }
        );
    }
}
