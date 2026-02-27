import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role
    
    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get users by role
    const superAdmins = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' },
    });

    const centerLeaders = await prisma.user.count({
      where: { role: 'Center_Leader' },
    });

    const lecturers = await prisma.user.count({
      where: { role: 'Lecturer' },
    });

    const students = await prisma.student.count();

    const applicants = await prisma.application.count();

    // Get users created in the last 24 hours (recent activity)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentActivity = await prisma.user.count({
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
    });

    // Calculate active users (for demo, we'll consider all users as active)
    // In production, you might have a lastLogin field
    const activeUsers = totalUsers;
    const inactiveUsers = 0;

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      superAdmins,
      centerLeaders,
      lecturers,
      students,
      applicants,
      recentActivity,
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

