
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

        const supervisees = await prisma.studentProgramme.findMany({
            where: {
                supervisorId: userId,
                status: { in: ['ADMITTED', 'REGISTERED', 'IN_PROGRESS'] }
            },
            include: {
                student: {
                    include: {
                        personalInfo: {
                            select: {
                                firstname: true,
                                surname: true,
                                email: true,
                                phoneNumber: true,
                                avatar: true,
                            }
                        },
                        application: {
                            select: {
                                firstname: true,
                                surname: true,
                                email: true,
                                phoneNumber: true,
                                avatar: true,
                            }
                        },
                    }
                },
                program: {
                    select: {
                        title: true,
                        level: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formatted = supervisees.map(sp => ({
            id: sp.student.id,
            fullName: `${sp.student.personalInfo?.firstname || sp.student.application?.firstname || ''} ${sp.student.personalInfo?.surname || sp.student.application?.surname || ''}`.trim(),
            matricNumber: sp.student.matricNumber,
            email: sp.student.personalInfo?.email || sp.student.application?.email,
            program: sp.program.title,
            level: sp.program.level,
            status: sp.status,
            admissionSession: sp.admissionSession
        }));

        return NextResponse.json({
            success: true,
            students: formatted
        });

    } catch (error) {
        console.error('Error fetching supervisees:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch supervisees' }, { status: 500 });
    }
}
