import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            orderBy: [
                { displayOrder: 'asc' },
                { title: 'asc' },
            ],
        });
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, lead, dueDate, images, video, displayOrder, accessCode } = body;

        const project = await prisma.project.create({
            data: {
                title,
                description,
                lead,
                dueDate: new Date(dueDate),
                images: images || [],
                video: video || null,
                displayOrder: displayOrder ?? 0,
                accessCode: accessCode === '' || accessCode == null ? null : String(accessCode),
            },
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}
