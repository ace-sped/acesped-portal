import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const ACADEMIC_SESSIONS = ['2025/2026', '2026/2027', '2027/2028'] as const;
const SEMESTERS = ['First', 'Second'] as const;

async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.systemSetting.findUnique({
    where: { key },
    select: { value: true },
  });
  return row?.value ?? null;
}

async function setSetting(key: string, value: string) {
  await prisma.systemSetting.upsert({
    where: { key },
    create: { key, value, updatedAt: new Date() },
    update: { value, updatedAt: new Date() },
  });
}

// GET current active session + semester (for APC)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;
    if (role !== 'Academic_Program_Coordinator' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const academicSession = await getSetting('active_academic_session');
    const semester = await getSetting('active_semester');

    return NextResponse.json({
      success: true,
      academicSession: academicSession || '2025/2026',
      semester: semester || 'First',
      options: { academicSessions: ACADEMIC_SESSIONS, semesters: SEMESTERS },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Sessions GET error:', err?.name, err?.message);
    const isDev = process.env.NODE_ENV === 'development';
    const hint = err?.message?.includes('system_settings') || err?.message?.includes('does not exist')
      ? ' Run: npx prisma migrate deploy'
      : '';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch session settings',
        ...(isDev && { error: err?.message, hint }),
      },
      { status: 500 }
    );
  }
}

// PATCH set active session + semester
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;
    if (role !== 'Academic_Program_Coordinator' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { academicSession, semester } = body;

    if (!academicSession || !ACADEMIC_SESSIONS.includes(academicSession)) {
      return NextResponse.json(
        { success: false, message: 'Invalid academic session. Must be one of: ' + ACADEMIC_SESSIONS.join(', ') },
        { status: 400 }
      );
    }
    if (!semester || !SEMESTERS.includes(semester)) {
      return NextResponse.json(
        { success: false, message: 'Invalid semester. Must be First or Second' },
        { status: 400 }
      );
    }

    await setSetting('active_academic_session', academicSession);
    await setSetting('active_semester', semester);

    return NextResponse.json({
      success: true,
      message: 'Active session updated successfully',
      academicSession,
      semester,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Sessions PATCH error:', err?.name, err?.message, err?.stack);
    const isDev = process.env.NODE_ENV === 'development';
    const hint = err?.message?.includes('system_settings') || err?.message?.includes('does not exist')
      ? ' Run: npx prisma migrate deploy'
      : '';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update session settings',
        ...(isDev && { error: err?.message, hint }),
      },
      { status: 500 }
    );
  }
}
