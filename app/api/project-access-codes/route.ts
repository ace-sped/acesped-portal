import { NextResponse } from 'next/server';
import { createAccessCode, getAllAccessCodes } from '@/lib/project-access-codes';

// GET - Get all access codes
export async function GET(req: Request) {
    try {
        const accessCodes = await getAllAccessCodes();
        return NextResponse.json(accessCodes);
    } catch (error) {
        console.error('Error fetching project access codes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch access codes' },
            { status: 500 }
        );
    }
}

// POST - Create a new access code
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, accessTo, maxUses, createdBy } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Code is required' },
                { status: 400 }
            );
        }

        if (!accessTo || !Array.isArray(accessTo) || accessTo.length === 0) {
            return NextResponse.json(
                { error: 'accessTo is required and must be a non-empty array' },
                { status: 400 }
            );
        }

        const accessCode = await createAccessCode(code, accessTo, {
            maxUses,
            createdBy
        });

        return NextResponse.json(accessCode, { status: 201 });
    } catch (error: any) {
        console.error('Error creating access code:', error);
        
        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'This access code already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create access code' },
            { status: 500 }
        );
    }
}
