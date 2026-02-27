import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET active academic session + semester (public, for student dashboard and course registration)
export async function GET() {
  try {
    const [sessionRow, semesterRow] = await Promise.all([
      prisma.systemSetting.findUnique({
        where: { key: 'active_academic_session' },
        select: { value: true },
      }),
      prisma.systemSetting.findUnique({
        where: { key: 'active_semester' },
        select: { value: true },
      }),
    ]);

    const academicSession = sessionRow?.value ?? '2025/2026';
    const semester = semesterRow?.value ?? 'First';

    return NextResponse.json({
      success: true,
      academicSession,
      semester,
      displayText: `${academicSession} - ${semester} Semester`,
    });
  } catch (error) {
    console.error('Active session GET error:', error);
    return NextResponse.json(
      { success: true, academicSession: '2025/2026', semester: 'First', displayText: '2025/2026 - First Semester' }
    );
  }
}
