import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const academicYear = searchParams.get('academicYear');

        // Build filter for Applications
        const appWhere = academicYear && academicYear !== 'ALL'
            ? { admissionSession: academicYear }
            : {};

        // 1. Fetch Applications (primary source of truth)
        const applications = await prisma.application.findMany({
            where: {
                ...appWhere,
                applicationNumber: { not: null }, // valid applicants only
            },
            select: {
                id: true,
                applicationNumber: true,
                firstname: true,
                surname: true,
                gender: true,
                programChoice: true,
                programType: true, // e.g., MSc, PhD
                admissionSession: true, // academicYear
                status: true,
            },
            orderBy: {
                applicationNumber: 'asc',
            }
        });

        // 2. Fetch existing Admission Exercises
        // We could filter this too, but fetching all is simpler for merging if dataset isn't huge.
        // Optimization: fetch only for the application numbers we found
        const applicationNumbers = applications.map(a => a.applicationNumber).filter(Boolean) as string[];

        const exercises = await prisma.admissionExercise.findMany({
            where: {
                applicationNumber: { in: applicationNumbers }
            }
        });

        const exercisesMap = new Map(exercises.map(e => [e.applicationNumber, e]));

        // 3. Merge Data (include applicationId and status for approve/reject actions)
        const mergedResults = applications.map(app => {
            const existing = exercisesMap.get(app.applicationNumber!);

            const base = {
                applicationId: app.id,
                status: app.status,
            };

            if (existing) {
                return { ...existing, ...base };
            }

            // Create a "virtual" record for display
            return {
                id: `virtual-${app.applicationNumber}`, // Temp ID for frontend key
                academicYear: app.admissionSession || '-',
                applicationNumber: app.applicationNumber!,
                name: `${app.firstname} ${app.surname}`,
                gender: app.gender,
                program: app.programChoice,
                level: app.programType,
                testScore: 0,
                comportment: 0,
                answer: 0,
                proposal: 0,
                total: 0,
                isVirtual: true, // flag for frontend if needed
                ...base,
            };
        });

        // 4. Get distinct academic years from Applications
        const distinctYears = await prisma.application.findMany({
            select: { admissionSession: true },
            distinct: ['admissionSession'],
            where: { admissionSession: { not: '' } },
            orderBy: { admissionSession: 'desc' }
        });

        return NextResponse.json({
            success: true,
            exercises: mergedResults,
            years: distinctYears.map(y => y.admissionSession),
        });

    } catch (error) {
        console.error('Error fetching admission exercises:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch admission exercises' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            applicationNumber,
            testScore,
            comportment,
            answer,
            proposal,
            // Additional fields needed for creation
            name,
            gender,
            program,
            level,
            academicYear
        } = body;

        if (!applicationNumber) {
            return NextResponse.json(
                { success: false, message: 'Application Number is required' },
                { status: 400 }
            );
        }

        // Validate scores
        const vTest = Math.max(0, parseInt(testScore) || 0);
        const vComportment = Math.max(0, parseInt(comportment) || 0);
        const vAnswer = Math.max(0, parseInt(answer) || 0);
        const vProposal = Math.max(0, parseInt(proposal) || 0);
        const total = vTest + vComportment + vAnswer + vProposal;

        // Check if record exists
        const existing = await prisma.admissionExercise.findFirst({
            where: { applicationNumber }
        });

        let result;

        if (existing) {
            // Update
            result = await prisma.admissionExercise.update({
                where: { id: existing.id },
                data: {
                    testScore: vTest,
                    comportment: vComportment,
                    answer: vAnswer,
                    proposal: vProposal,
                    total: total,
                }
            });
        } else {
            // Create new
            result = await prisma.admissionExercise.create({
                data: {
                    applicationNumber,
                    name: name || '',
                    gender: gender || '',
                    program: program || '',
                    level: level || '',
                    academicYear: academicYear || '',
                    testScore: vTest,
                    comportment: vComportment,
                    answer: vAnswer,
                    proposal: vProposal,
                    total: total,
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error updating admission exercise:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update admission exercise' },
            { status: 500 }
        );
    }
}
