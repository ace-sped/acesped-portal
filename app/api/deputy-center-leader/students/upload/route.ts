import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StudentStatus } from '@prisma/client';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const STUDENT_STATUSES = new Set<string>(Object.values(StudentStatus));

function getValue(row: Record<string, unknown>, keys: string[]) {
    const rowKeys = Object.keys(row);
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null) return row[key];
        const foundKey = rowKeys.find((rowKey) => rowKey.trim().toLowerCase() === key.toLowerCase());
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) return row[foundKey];
    }
    return undefined;
}

function readCell(row: Record<string, unknown>, keys: string[]) {
    const value = getValue(row, keys);
    if (value === undefined || value === null) return '';
    return String(value).trim();
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        try {
            await jwtVerify(token, JWT_SECRET);
        } catch {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        if (!(file instanceof File)) {
            return NextResponse.json({ success: false, message: 'No CSV file uploaded' }, { status: 400 });
        }

        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.csv')) {
            return NextResponse.json({ success: false, message: 'Please upload a CSV file' }, { status: 400 });
        }

        const workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'The CSV file is empty' }, { status: 400 });
        }

        const programs = await prisma.program.findMany({
            select: { id: true, title: true },
        });

        let created = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (let index = 0; index < rows.length; index += 1) {
            const row = rows[index];
            const line = index + 2;
            const surname = readCell(row, ['Surname', 'Last Name', 'Lastname']);
            const firstname = readCell(row, ['First Name', 'Firstname', 'Given Name']);
            const email = readCell(row, ['Email', 'Email Address']).toLowerCase();
            const matricNumber = readCell(row, ['Matric Number', 'Matric No', 'MatricNumber']);
            const registrationNumber = readCell(row, ['Registration Number', 'Reg Number', 'RegistrationNumber']);
            const phoneNumber = readCell(row, ['Phone', 'Phone Number', 'Mobile']) || 'N/A';
            const gender = readCell(row, ['Gender']) || 'N/A';
            const programTitle = readCell(row, ['Program', 'Programme', 'Program Title']);
            const admissionSession = readCell(row, ['Admission Session', 'Session']) || '2026/2027';
            const modeOfStudy = readCell(row, ['Mode of Study', 'Study Mode']) || 'Full-time';
            const password = readCell(row, ['Password']);
            const statusValue = readCell(row, ['Status']).toUpperCase();
            const status = STUDENT_STATUSES.has(statusValue) ? (statusValue as StudentStatus) : StudentStatus.ACTIVE;

            if (!surname && !firstname && !email) {
                continue;
            }

            if (!surname || !firstname || !email) {
                skipped += 1;
                errors.push(`Row ${line}: surname, first name, and email are required`);
                continue;
            }

            const existing = await prisma.student.findFirst({
                where: {
                    OR: [
                        ...(matricNumber ? [{ matricNumber }] : []),
                        ...(registrationNumber ? [{ registrationNumber }] : []),
                        { personalInfo: { email: { equals: email, mode: 'insensitive' } } },
                    ],
                },
                select: { id: true },
            });

            if (existing) {
                skipped += 1;
                errors.push(`Row ${line}: a student with this email or number already exists`);
                continue;
            }

            const program = programTitle
                ? programs.find((item) => item.title.toLowerCase() === programTitle.toLowerCase())
                : undefined;

            try {
                await prisma.$transaction(async (tx) => {
                    const student = await tx.student.create({
                        data: {
                            matricNumber: matricNumber || null,
                            registrationNumber: registrationNumber || null,
                            status,
                            password: password ? await bcrypt.hash(password, 10) : null,
                        },
                    });

                    await tx.studentPersonalInfo.create({
                        data: {
                            studentId: student.id,
                            email,
                            firstname,
                            surname,
                            dateOfBirth: readCell(row, ['Date of Birth', 'DOB']) || 'N/A',
                            gender,
                            nationality: readCell(row, ['Nationality']) || 'Nigeria',
                            phoneNumber,
                            address: readCell(row, ['Address']) || 'N/A',
                            homeAddress: readCell(row, ['Home Address']) || 'N/A',
                            homeTown: readCell(row, ['Home Town']) || 'N/A',
                            city: readCell(row, ['City']) || 'N/A',
                            state: readCell(row, ['State']) || 'N/A',
                            country: readCell(row, ['Country']) || 'Nigeria',
                            religion: readCell(row, ['Religion']) || 'N/A',
                        },
                    });

                    if (program) {
                        await tx.studentProgramme.create({
                            data: {
                                studentId: student.id,
                                programId: program.id,
                                admissionSession,
                                modeOfStudy,
                                status: 'ADMITTED',
                            },
                        });
                    }
                });
                created += 1;
            } catch (error) {
                skipped += 1;
                errors.push(`Row ${line}: ${error instanceof Error ? error.message : 'Failed to import'}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Imported ${created} student${created === 1 ? '' : 's'}${skipped ? `. ${skipped} row${skipped === 1 ? '' : 's'} skipped` : ''}.`,
            created,
            skipped,
            errors: errors.slice(0, 8),
        });
    } catch (error) {
        console.error('Error uploading students CSV:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to upload students CSV' },
            { status: 500 }
        );
    }
}
