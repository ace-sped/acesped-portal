import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all lecturers
export async function GET(request: NextRequest) {
    try {
        // TODO: Add authentication check for Deputy_Center_Leader role

        const lecturers = await prisma.lecturer.findMany({
            select: {
                id: true,
                email: true,
                firstname: true,
                surname: true,
                avatar: true,
                phoneNumber: true,
                role: true,
                staffId: true,
                title: true,
                department: true,
                faculty: true,
                qualification: true,
                specialization: true,
                employmentType: true,
                status: true,
                appointmentDate: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({
            success: true,
            lecturers,
        });
    } catch (error) {
        console.error('Error fetching lecturers:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch lecturers' },
            { status: 500 }
        );
    }
}


// POST create new lecturer
export async function POST(request: NextRequest) {
    try {
        // TODO: Add authentication check for Deputy_Center_Leader role

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
            avatar
        } = body;

        // Validate required fields
        if (!email || !password || !firstname || !surname) {
            return NextResponse.json(
                { success: false, message: 'Email, password, firstname, and surname are required' },
                { status: 400 }
            );
        }

        // Check if lecturer already exists in Lecturer table
        const existingLecturer = await prisma.lecturer.findUnique({
            where: { email },
        });

        if (existingLecturer) {
            return NextResponse.json(
                { success: false, message: 'Lecturer with this email already exists' },
                { status: 400 }
            );
        }

        // Also check if staffId exists if provided
        if (staffId) {
            const existingStaffId = await prisma.lecturer.findUnique({
                where: { staffId },
            });
            if (existingStaffId) {
                return NextResponse.json(
                    { success: false, message: 'Lecturer with this Staff ID already exists' },
                    { status: 400 }
                );
            }
        }

        // Hash password
        // Note: We need to import bcrypt. If it's not imported at the top, we need to add it.
        // Assuming bcrypt was imported in the original file or we need to add the import.
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create lecturer
        const lecturer = await prisma.lecturer.create({
            data: {
                email,
                firstname,
                surname,
                password: hashedPassword,
                role: 'Lecturer', // Default role
                staffId: staffId || null,
                title: title || null,
                department: department || null,
                faculty: faculty || null,
                qualification: qualification || null,
                specialization: specialization || null,
                employmentType: employmentType || null,
                phoneNumber: phoneNumber || null,
                avatar: avatar || null,
                status: 'ACTIVE',
            },
            select: {
                id: true,
                email: true,
                firstname: true,
                surname: true,
                staffId: true,
                department: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            lecturer,
            message: 'Lecturer created successfully',
        });
    } catch (error: any) {
        console.error('Error creating lecturer:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create lecturer',
                error: error.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}
