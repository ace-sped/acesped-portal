import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET dashboard statistics (excluding SUPER_ADMIN data for Center Leaders)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for Center_Leader role

    // Get total users count (excluding SUPER_ADMIN and Center_Leader)
    const totalUsers = await prisma.user.count({
      where: {
        role: {
          notIn: ['SUPER_ADMIN', 'Center_Leader', 'Deputy_Center_Leader'],
        },
      },
    });

    // Get users by role (excluding SUPER_ADMIN and Center_Leader)

    const lecturers = await prisma.user.count({
      where: { role: 'Lecturer' },
    });

  const students = await prisma.student.count();

  const applicants = await prisma.application.count();

    const staff = await prisma.user.count({
      where: { role: 'Staff' },
    });

    // Get users created in the last 24 hours (recent activity, excluding SUPER_ADMIN and Center_Leader)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentActivity = await prisma.user.count({
      where: {
        createdAt: {
          gte: yesterday,
        },
        role: {
          notIn: ['SUPER_ADMIN', 'Center_Leader', 'Deputy_Center_Leader'],
        },
      },
    });

    // Calculate active users (for demo, we'll consider all users as active)
    // In production, you might have a lastLogin field
    const activeUsers = totalUsers;

    const stats = {
      totalUsers,
      activeUsers,
      lecturers,
      students,
      applicants,
      staff,
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

