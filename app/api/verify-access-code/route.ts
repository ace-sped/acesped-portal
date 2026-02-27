import { NextResponse } from 'next/server';
import { validateAccessCode, incrementAccessCodeUsage } from '@/lib/project-access-codes';

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

        // Validate the access code
        const projectIds = await validateAccessCode(accessCode.trim());

        if (!projectIds || projectIds.length === 0) {
            return NextResponse.json(
                { 
                    error: 'Invalid access code or no projects found', 
                    valid: false 
                },
                { status: 401 }
            );
        }

        // Increment usage count only on initial verification (from /access page)
        if (incrementUsage) {
            await incrementAccessCodeUsage(accessCode.trim());
        }

        return NextResponse.json({
            valid: true,
            message: 'Access code verified successfully',
            projectCount: projectIds.length
        });
    } catch (error) {
        console.error('Error verifying access code:', error);
        return NextResponse.json(
            { error: 'Failed to verify access code', valid: false },
            { status: 500 }
        );
    }
}
