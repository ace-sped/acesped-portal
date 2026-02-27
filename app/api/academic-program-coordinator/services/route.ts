
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // TODO: Authorization check

        const services = await prisma.service.findMany({
            where: {
                isActive: true
            },
            select: {
                id: true,
                title: true,
                slug: true,
                programs: {
                    where: {
                        isActive: true
                    },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        courseCode: true
                    },
                    orderBy: {
                        title: 'asc'
                    }
                }
            },
            orderBy: {
                displayOrder: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            services
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch services', error: String(error) },
            { status: 500 }
        );
    }
}
