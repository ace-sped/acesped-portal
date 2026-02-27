import { NextResponse } from 'next/server';
import { updateAccessCode, deleteAccessCode, deactivateAccessCode } from '@/lib/project-access-codes';
import { prisma } from '@/lib/prisma';

// GET - Get a specific access code
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const accessCode = await prisma.projectAccessCode.findUnique({
            where: { id }
        });

        if (!accessCode) {
            return NextResponse.json(
                { error: 'Access code not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(accessCode);
    } catch (error) {
        console.error('Error fetching access code:', error);
        return NextResponse.json(
            { error: 'Failed to fetch access code' },
            { status: 500 }
        );
    }
}

// PATCH - Update an access code
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { code, accessTo, isActive, maxUses } = body;

        const updatedAccessCode = await updateAccessCode(id, {
            code,
            accessTo,
            isActive,
            maxUses
        });

        return NextResponse.json(updatedAccessCode);
    } catch (error: any) {
        console.error('Error updating access code:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Access code not found' },
                { status: 404 }
            );
        }

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'This access code already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update access code' },
            { status: 500 }
        );
    }
}

// DELETE - Delete an access code
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await deleteAccessCode(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting access code:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Access code not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete access code' },
            { status: 500 }
        );
    }
}
