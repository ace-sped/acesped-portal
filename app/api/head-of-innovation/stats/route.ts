import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/head-of-innovation/stats
 * Returns dashboard stats for Head of Innovation: total projects, live (ongoing) projects, recent activity.
 */
export async function GET() {
    try {
        const now = new Date();

        const [totalProjects, liveProjects, recentActivity] = await Promise.all([
            prisma.project.count(),
            prisma.project.count({
                where: { dueDate: { gt: now } },
            }),
            (() => {
                const since = new Date();
                since.setDate(since.getDate() - 7);
                return prisma.project.count({
                    where: {
                        OR: [
                            { createdAt: { gte: since } },
                            { updatedAt: { gte: since } },
                        ],
                    },
                });
            })(),
        ]);

        const stats = {
            totalUsers: totalProjects,
            activeUsers: liveProjects,
            recentActivity,
        };

        return NextResponse.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error('Error fetching head-of-innovation stats:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
