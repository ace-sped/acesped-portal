
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // TODO: Authorization check

        const lecturers = await prisma.lecturer.findMany({
            select: {
                id: true,
                firstname: true,
                surname: true,
                email: true,
                role: true,
                coursesTaught: {
                    select: {
                        id: true,
                        title: true,
                        courseCode: true,
                        program: {
                            select: {
                                title: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                surname: 'asc'
            }
        });

        console.log(`Fetched ${lecturers.length} lecturers`);

        return NextResponse.json({
            success: true,
            lecturers
        });
    } catch (error) {
        console.error('Error fetching lecturers:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch lecturers' },
            { status: 500 }
        );
    }
}
