
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, StudentStatus } from '@prisma/client';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

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

        const pageParam = searchParams.get('page');
        const limitParam = searchParams.get('limit');

        const page = pageParam ? parseInt(pageParam) : 1;
        const limit = limitParam ? parseInt(limitParam) : 10;

        // Safety check for NaN or invalid values
        const safePage = isNaN(page) || page < 1 ? 1 : page;
        const safeLimit = isNaN(limit) || limit < 1 ? 10 : limit;

        const skip = (safePage - 1) * safeLimit;
        const search = searchParams.get('search') || '';

        const status = searchParams.get('status') || 'ACTIVE';
        const programType = searchParams.get('programType');

        const where: any = {};

        if (status !== 'ALL') {
            where.status = status;
        }

        if (programType && programType !== 'ALL') {
            const pt = programType.toUpperCase();
            if (pt === 'MSC' || pt === 'MASTERS') {
                where.application = {
                    OR: [
                        { programType: { contains: 'MSC', mode: 'insensitive' } },
                        { programType: { contains: 'Master', mode: 'insensitive' } },
                        { programType: { contains: 'M.Sc', mode: 'insensitive' } }
                    ]
                };
            } else if (pt === 'PHD' || pt === 'DOCTOR') {
                where.application = {
                    OR: [
                        { programType: { contains: 'PHD', mode: 'insensitive' } },
                        { programType: { contains: 'Doctor', mode: 'insensitive' } },
                        { programType: { contains: 'Ph.D', mode: 'insensitive' } }
                    ]
                };
            } else if (pt === 'PGD') {
                where.application = {
                    OR: [
                        { programType: { contains: 'PGD', mode: 'insensitive' } },
                        { programType: { contains: 'Diploma', mode: 'insensitive' } }
                    ]
                };
            } else {
                where.application = {
                    programType: {
                        contains: programType,
                        mode: 'insensitive'
                    }
                };
            }
        }

        if (search) {
            where.OR = [
                { matricNumber: { contains: search, mode: 'insensitive' } },
                { registrationNumber: { contains: search, mode: 'insensitive' } },
                {
                    application: {
                        applicationNumber: { contains: search, mode: 'insensitive' }
                    }
                },
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
                select: {
                    id: true,
                    matricNumber: true,
                    registrationNumber: true,
                    status: true,
                    personalInfo: {
                        select: {
                            firstname: true,
                            surname: true,
                            email: true,
                            avatar: true
                        }
                    },
                    application: {
                        select: {
                            applicationNumber: true,
                            email: true,
                            firstname: true,
                            surname: true,
                            avatar: true,
                            programType: true
                        }
                    },
                    programmes: {
                        where: { status: 'ADMITTED' },
                        include: {
                            program: {
                                select: {
                                    title: true,
                                    level: true
                                }
                            }
                        },
                        take: 1
                    },
                },
                skip,
                take: safeLimit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.student.count({ where })
        ]);

        const formattedStudents = students.map(student => ({
            id: student.id,
            matricNumber: student.matricNumber,
            registrationNumber: student.registrationNumber || null,
            firstname: student.personalInfo?.firstname || student.application?.firstname || '',
            surname: student.personalInfo?.surname || student.application?.surname || '',
            name: `${student.personalInfo?.surname || student.application?.surname || ''} ${student.personalInfo?.firstname || student.application?.firstname || ''}`.trim() || 'Student',
            email: student.personalInfo?.email || student.application?.email || null,
            avatar: student.personalInfo?.avatar || student.application?.avatar || null,
            program: student.programmes[0]?.program.title || 'N/A',
            programType: student.application?.programType || student.programmes[0]?.program.level || 'N/A',
            status: student.status
        }));

        return NextResponse.json({
            success: true,
            students: formattedStudents,
            pagination: {
                total,
                pages: Math.ceil(total / safeLimit),
                current: safePage,
                limit: safeLimit
            }
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch students', error: (error as any).message },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
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

        const body = await request.json();

        if (!body || typeof body !== 'object') {
            return NextResponse.json(
                { success: false, message: 'Invalid request body' },
                { status: 400 }
            );
        }

        const {
            id,
            firstname,
            surname,
            email,
            matricNumber,
            registrationNumber,
            status,
            password
        } = body as {
            id?: string;
            firstname?: string;
            surname?: string;
            email?: string;
            matricNumber?: string | null;
            registrationNumber?: string | null;
            status?: string;
            password?: string;
        };

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Student ID is required' },
                { status: 400 }
            );
        }

        const normalizedFirstname = (firstname || '').trim();
        const normalizedSurname = (surname || '').trim();
        const normalizedEmail = (email || '').trim();
        const normalizedMatric = typeof matricNumber === 'string' ? matricNumber.trim() : '';
        const normalizedRegistration = typeof registrationNumber === 'string' ? registrationNumber.trim() : '';
        const normalizedStatus = (status || '').trim();

        if (!normalizedFirstname || !normalizedSurname || !normalizedEmail || !normalizedStatus) {
            return NextResponse.json(
                { success: false, message: 'Firstname, surname, email and status are required' },
                { status: 400 }
            );
        }

        if (!['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'WITHDRAWN', 'DEFERRED'].includes(normalizedStatus)) {
            return NextResponse.json(
                { success: false, message: 'Invalid student status' },
                { status: 400 }
            );
        }

        if (typeof password === 'string' && password.length > 0 && password.length < 8) {
            return NextResponse.json(
                { success: false, message: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        const existingStudent = await prisma.student.findUnique({
            where: { id },
            select: {
                id: true,
                personalInfo: { select: { id: true } },
                application: { select: { id: true } }
            }
        });

        if (!existingStudent) {
            return NextResponse.json(
                { success: false, message: 'Student not found' },
                { status: 404 }
            );
        }

        await prisma.$transaction(async (tx) => {
            const studentUpdateData: Prisma.StudentUpdateInput = {
                status: normalizedStatus as StudentStatus,
                matricNumber: normalizedMatric || null,
                registrationNumber: normalizedRegistration || null
            };

            if (typeof password === 'string' && password.length > 0) {
                studentUpdateData.password = await bcrypt.hash(password, 10);
            }

            await tx.student.update({
                where: { id },
                data: studentUpdateData
            });

            if (existingStudent.personalInfo?.id) {
                await tx.studentPersonalInfo.update({
                    where: { studentId: id },
                    data: {
                        firstname: normalizedFirstname,
                        surname: normalizedSurname,
                        email: normalizedEmail
                    }
                });
                return;
            }

            if (existingStudent.application?.id) {
                await tx.application.update({
                    where: { id: existingStudent.application.id },
                    data: {
                        firstname: normalizedFirstname,
                        surname: normalizedSurname,
                        email: normalizedEmail
                    }
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Student updated successfully'
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json(
                { success: false, message: 'Matric number or registration number already exists' },
                { status: 409 }
            );
        }

        console.error('Error updating student:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update student' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
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

        const body = await request.json();

        if (!body || typeof body !== 'object') {
            return NextResponse.json(
                { success: false, message: 'Invalid request body' },
                { status: 400 }
            );
        }

        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Student ID is required' },
                { status: 400 }
            );
        }

        // Delete all related records in a transaction
        await prisma.$transaction([
            prisma.studentPersonalInfo.deleteMany({ where: { studentId: id } }),
            prisma.studentProgramme.deleteMany({ where: { studentId: id } }),
            prisma.studentNextOfKin.deleteMany({ where: { studentId: id } }),
            prisma.studentEducationHistory.deleteMany({ where: { studentId: id } }),
            prisma.studentEmploymentHistory.deleteMany({ where: { studentId: id } }),
            prisma.studentMedicalHistory.deleteMany({ where: { studentId: id } }),
            prisma.studentDocument.deleteMany({ where: { studentId: id } }),
            prisma.studentSponsor.deleteMany({ where: { studentId: id } }),
            prisma.studentCourseRegistration.deleteMany({ where: { studentId: id } }),
            prisma.student.delete({ where: { id } })
        ]);

        return NextResponse.json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting student:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete student' },
            { status: 500 }
        );
    }
}
