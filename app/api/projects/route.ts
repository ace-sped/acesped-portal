import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Project } from '@/lib/projects-data'; // importing type only, we will return this shape
import { validateAccessCode } from '@/lib/project-access-codes';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const accessCode = searchParams.get('accessCode');

        let where: any = {};

        // If access code is provided, validate it and filter projects
        if (accessCode) {
            const projectIds = await validateAccessCode(accessCode);
            
            if (!projectIds) {
                return NextResponse.json([]);
            }

            // Filter projects by IDs from accessTo array
            where.id = {
                in: projectIds
            };
        }

        const dbProjects = await prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // Current date for status calculation
        const now = new Date();

        // Map DB projects to frontend Project interface
        const projects = dbProjects.map((p: any) => {
            const isOngoing = new Date(p.dueDate) > now;

            return {
                id: p.id,
                title: p.title,
                description: p.description || '',
                status: isOngoing ? 'Ongoing' : 'Completed',
                duration: `Until ${new Date(p.dueDate).toLocaleDateString()}`,
                researchers: 1, // Mock value as we only have 'lead'
                area: 'Innovation', // Mock value
                imageSrc: p.images && p.images.length > 0 ? p.images[0] : '/images/lab.jpg', // Fallback image
                subImages: p.images && p.images.length > 1 ? p.images.slice(1) : [],
                isProtected: !!p.accessCode,
            };
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
