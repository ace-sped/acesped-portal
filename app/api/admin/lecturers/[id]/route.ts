import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// PUT update lecturer
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const {
            email, firstname, surname, password,
            avatar, staffId, title, department, faculty,
            qualification, specialization, bio, employmentType, status
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

        // Check email/staffId uniqueness if changed
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
            status: status || existingLecturer.status
        };

        // Handle avatar upload to Cloudinary if it's base64
        const { uploadBase64 } = require('@/lib/storage');

        if (avatar !== undefined) {
            let avatarUrl = avatar || null;
            if (avatarUrl && avatarUrl.startsWith('data:image')) {
                const uploadResult = await uploadBase64(avatarUrl, 'lecturers/avatars');
                if (uploadResult.success) {
                    avatarUrl = uploadResult.path;
                }
            }
            updateData.avatar = avatarUrl;
        }

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
