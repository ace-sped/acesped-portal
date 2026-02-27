
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

// Helper to get value from row case-insensitively
const getValue = (row: any, keys: string[]) => {
    const rowKeys = Object.keys(row);
    for (const key of keys) {
        // Exact match
        if (row[key] !== undefined) return row[key];
        // Case-insensitive match
        const foundKey = rowKeys.find(k => k.toLowerCase() === key.toLowerCase());
        if (foundKey && row[foundKey] !== undefined) return row[foundKey];
    }
    return undefined;
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'No file uploaded' },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        let successCount = 0;
        let failureCount = 0;
        const errors: string[] = [];

        // Pre-fetch all programs to minimize DB calls
        const programs = await prisma.program.findMany({
            select: { id: true, title: true, slug: true }
        });

        const affectedProgramIds = new Set<string>();

        // Debug log (server side)
        if (data.length > 0) {
            console.log('First row keys:', Object.keys(data[0] as object));
        }

        for (const row of data as any[]) {
            const getVal = (keys: string[]) => {
                const val = getValue(row, keys);
                return val ? String(val).trim() : undefined;
            };

            const title = getVal(['Title', 'Course Title']);

            try {
                const courseCode = getVal(['Course Code', 'Code', 'courseCode']);
                const programTitle = getVal(['Program', 'Program Name', 'Department', 'program']);
                const programType = getVal(['Program Type', 'Level', 'Type', 'programType']);
                const courseType = getVal(['Course Type', 'Elective/Core', 'courseType']);
                const creditHours = getVal(['Credit Hours', 'Credits', 'Credit', 'creditHours']);
                const semester = getVal(['Semester', 'Sem', 'semester']);
                const overview = getVal(['Description', 'Overview', 'Course Description', 'overview']);

                if (!title || !programTitle || !overview) {
                    throw new Error(`Missing fields. Found: Title=${title}, Program=${programTitle}, Desc=${!!overview}`);
                }

                // Find Program ID
                let program = programs.find(p => p.title.toLowerCase() === programTitle.toLowerCase());

                if (!program) {
                    // Fuzzy match: check if one contains the other.
                    // Accessing .toLowerCase() safely
                    const pTitleLower = programTitle.toLowerCase();
                    program = programs.find(p => {
                        const dbTitleLower = p.title.toLowerCase();
                        return dbTitleLower.includes(pTitleLower) || pTitleLower.includes(dbTitleLower);
                    });
                }

                if (!program) {
                    throw new Error(`Program '${programTitle}' not found in database. Available: ${programs.length} programs.`);
                }

                // Generate slug
                let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                if (!baseSlug) baseSlug = 'course'; // Fallback
                let slug = baseSlug;
                let counter = 1;

                // Check strict slug uniqueness
                while (await prisma.course.findUnique({ where: { slug } })) {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }

                // Map Program Type
                let mappedProgramType = programType;
                if (programType) {
                    const upperType = programType.toUpperCase();
                    if (upperType.includes('PHD')) mappedProgramType = 'PHD';
                    else if (upperType.includes('MSC') || upperType.includes('MENG') || upperType.includes('MASTER')) mappedProgramType = 'MASTERS';
                    else if (upperType.includes('PGD')) mappedProgramType = 'PGD';
                }

                const parsedCreditHours = creditHours ? parseInt(creditHours) : null;

                await prisma.course.create({
                    data: {
                        title,
                        slug,
                        courseCode,
                        courseType,
                        overview,
                        programId: program.id,
                        programType: mappedProgramType,
                        creditHours: parsedCreditHours && !isNaN(parsedCreditHours) ? parsedCreditHours : null,
                        semester,
                        isActive: true,
                    }
                });

                successCount++;
            } catch (error: any) {
                failureCount++;
                errors.push(`Row '${title || 'Unknown'}': ${error.message}`);
                console.error(`Row failed:`, error.message);
            }
        }



        return NextResponse.json({
            success: true, // Always valid JSON even if partial failure
            message: `Processed ${data.length} rows. Success: ${successCount}, Failed: ${failureCount}`,
            errors: errors.slice(0, 20)
        });

    } catch (error: any) {
        console.error('Error processing CSV:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to process file', error: error.message },
            { status: 500 }
        );
    }
}
