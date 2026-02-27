import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT update lecturer
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // TODO: Add authentication check

        const { id } = await params;
        const body = await request.json();
        const {
            email,
            firstname,
            surname,
            password,
            staffId,
            title,
            department,
            faculty,
            qualification,
            specialization,
            employmentType,
            phoneNumber,
            avatar,
            status
        } = body;

        // Check if lecturer exists
        const existingLecturer = await prisma.lecturer.findUnique({
            where: { id },
        });

        if (!existingLecturer) {
            return NextResponse.json(
                { success: false, message: 'Lecturer not found' },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {
            email,
            firstname,
            surname,
            role: 'Lecturer',
            staffId: staffId || null,
            title: title || null,
            department: department || null,
            faculty: faculty || null,
            qualification: qualification || null,
            specialization: specialization || null,
            employmentType: employmentType || null,
            phoneNumber: phoneNumber || null,
            avatar: avatar || null,
            status: status || existingLecturer.status,
        };

        // Update password if provided
        if (password) {
            const bcrypt = require('bcryptjs');
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update lecturer
        const lecturer = await prisma.lecturer.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                firstname: true,
                surname: true,
                staffId: true,
                role: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            lecturer,
            message: 'Lecturer updated successfully',
        });
    } catch (error: any) {
        console.error('Error updating lecturer:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update lecturer',
                error: error.message || 'Unknown error'
            },
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
        // TODO: Add authentication check

        const { id } = await params;

        // Check if lecturer exists
        const existingLecturer = await prisma.lecturer.findUnique({
            where: { id },
        });

        if (!existingLecturer) {
            return NextResponse.json(
                { success: false, message: 'Lecturer not found' },
                { status: 404 }
            );
        }

        // Delete lecturer
        await prisma.lecturer.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Lecturer deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting lecturer:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to delete lecturer',
                error: error.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}
