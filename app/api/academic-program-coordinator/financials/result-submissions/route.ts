
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const submissions = await (prisma as any).resultSubmission.findMany({
            include: {
                lecturer: {
                    select: {
                        id: true,
                        firstname: true,
                        surname: true,
                        email: true
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        courseCode: true
                    }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });

        return NextResponse.json(submissions);
    } catch (error) {
        console.error('Error fetching result submissions:', error);
        return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }
}
