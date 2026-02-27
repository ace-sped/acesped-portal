import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// PUT update lecturer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    try { await jwtVerify(token, JWT_SECRET); } catch { return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 }); }

    const body = await request.json();
    const {
      email, firstname, surname, password,
      avatar, staffId, title, department, faculty,
      qualification, specialization, bio, employmentType, status, appointmentDate
    } = body;
    const { id } = await params;

    const existingLecturer = await prisma.lecturer.findUnique({
      where: { id },
    });

    if (!existingLecturer) {
      return NextResponse.json(
        { success: false, message: 'Lecturer not found' },
        { status: 404 }
      );
    }

    if ((email && email !== existingLecturer.email) || (staffId && staffId !== existingLecturer.staffId)) {
      const duplicate = await prisma.lecturer.findFirst({
        where: {
          OR: [
            email ? { email } : {},
            staffId ? { staffId } : {}
          ],
          NOT: { id }
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: 'Email or Staff ID already in use' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      email,
      firstname,
      surname,
      staffId: staffId || null,
      title: title || null,
      department: department || null,
      faculty: faculty || null,
      qualification: qualification || null,
      specialization: specialization || null,
      bio: bio || null,
      employmentType: employmentType || null,
      status: status || existingLecturer.status,
      appointmentDate: appointmentDate ? new Date(appointmentDate) : existingLecturer.appointmentDate
    };

    if (avatar !== undefined) updateData.avatar = avatar;

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const lecturer = await prisma.lecturer.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      lecturer,
      message: 'Lecturer updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating lecturer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update lecturer', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE lecturer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    try { await jwtVerify(token, JWT_SECRET); } catch { return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 }); }

    const { id } = await params;

    await prisma.lecturer.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Lecturer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lecturer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete lecturer' },
      { status: 500 }
    );
  }
}
