import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET dashboard statistics for Academic Program Coordinator
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for Academic_Program_Coordinator role
    
    // Get total services count
    const totalServices = await prisma.service.count({
      where: {
        isActive: true,
      },
    });

    // Get total programs count
    const totalPrograms = await prisma.program.count({
      where: {
        isActive: true,
      },
    });

    // Get recent activity (applications created in the last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentApplications = await prisma.application.count({
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
    });

    // Get recent subscriptions (course subscriptions created in the last 24 hours)
    const recentSubscriptions = await prisma.courseSubscription.count({
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
    });

    // Total recent activity (applications + subscriptions)
    const recentActivity = recentApplications + recentSubscriptions;

    const stats = {
      totalUsers: totalServices, // Maps to "Total Services" label
      activeUsers: totalPrograms, // Maps to "Total Programs" label
      recentActivity,
      totalServices,
      totalPrograms,
      recentApplications,
      recentSubscriptions,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}



