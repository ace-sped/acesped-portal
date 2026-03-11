import { NextResponse } from 'next/server';
import { validateAccessCode, incrementAccessCodeUsage } from '@/lib/project-access-codes';

const DLI_ACCESS_CODE = '666';
const PROJECTS_ACCESS_CODE = '123';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { accessCode, incrementUsage = false } = body;

        if (!accessCode) {
            return NextResponse.json(
                { error: 'Access code is required', valid: false },
                { status: 400 }
            );
        }

        const trimmed = accessCode.trim();

        // Special codes: 666 → DLI, 123 → Projects (no DB lookup)
        if (trimmed === DLI_ACCESS_CODE) {
            return NextResponse.json({
                valid: true,
                message: 'Access code verified successfully',
                accessType: 'dli',
            });
        }
        if (trimmed === PROJECTS_ACCESS_CODE) {
            return NextResponse.json({
                valid: true,
                message: 'Access code verified successfully',
                accessType: 'projects',
            });
        }

        // Validate other codes against the database
        const projectIds = await validateAccessCode(trimmed);

        if (!projectIds || projectIds.length === 0) {
            return NextResponse.json(
                {
                    error: 'Invalid access code or no projects found',
                    valid: false
                },
                { status: 401 }
            );
        }

        if (incrementUsage) {
            await incrementAccessCodeUsage(trimmed);
        }

        return NextResponse.json({
            valid: true,
            message: 'Access code verified successfully',
            accessType: 'projects',
            projectCount: projectIds.length,
        });
    } catch (error) {
        console.error('Error verifying access code:', error);
        return NextResponse.json(
            { error: 'Failed to verify access code', valid: false },
            { status: 500 }
        );
    }
}
