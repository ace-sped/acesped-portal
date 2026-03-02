import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function parseDueDate(value: unknown): Date | null {
    if (value == null || value === '') return null;
    const d = new Date(value as string);
    return Number.isNaN(d.getTime()) ? null : d;
}

function ensureStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string');
    }
    if (typeof value === 'string' && value) return [value];
    return [];
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title, description, lead, dueDate, images, video, displayOrder, accessCode } = body;

        const parsedDue = parseDueDate(dueDate);
        const imagesArr = ensureStringArray(images);

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                ...(title !== undefined && { title: String(title) }),
                ...(description !== undefined && {
                    description: description === '' || description == null ? null : String(description),
                }),
                ...(lead !== undefined && { lead: String(lead) }),
                ...(parsedDue !== null && { dueDate: parsedDue }),
                images: imagesArr,
                video: video === '' || video == null ? null : String(video),
                ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) || 0 }),
                ...(accessCode !== undefined && {
                    accessCode: accessCode === '' || accessCode == null ? null : String(accessCode),
                }),
            },
        });

        return NextResponse.json(updatedProject);
    } catch (error: unknown) {
        console.error('Error updating project:', error);
        const isNotFound =
            error &&
            typeof error === 'object' &&
            'code' in error &&
            (error as { code?: string }).code === 'P2025';
        if (isNotFound) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }
        const message = error instanceof Error ? error.message : 'Failed to update project';
        return NextResponse.json(
            { error: 'Failed to update project', details: message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
