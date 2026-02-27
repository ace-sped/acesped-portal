import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET system health status
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role
    
    let databaseHealth = 'healthy';
    let apiHealth = 'healthy';
    let storageHealth = 'healthy';

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      databaseHealth = 'unhealthy';
    }

    // API is healthy if we reach this point
    // Storage check would depend on your storage solution
    // For now, we'll assume it's healthy

    const health = {
      database: databaseHealth,
      api: apiHealth,
      storage: storageHealth,
    };

    return NextResponse.json({
      success: true,
      health,
    });
  } catch (error) {
    console.error('Error checking health:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check system health' },
      { status: 500 }
    );
  }
}

