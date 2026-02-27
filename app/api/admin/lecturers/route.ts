import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET all lecturers
export async function GET(request: NextRequest) {
    try {
        // TODO: Add authentication check for SUPER_ADMIN role

        const lecturers = await prisma.lecturer.findMany({
            select: {
                id: true,
                email: true,
                firstname: true,
                surname: true,
                avatar: true,
                role: true,
                staffId: true,
                title: true,
                department: true,
                faculty: true,
                status: true,
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
        // TODO: Add authentication check for SUPER_ADMIN role

        const body = await request.json();
        const {
            email, firstname, surname, password,
            avatar, staffId, title, department, faculty,
            qualification, specialization, bio, employmentType
        } = body;

        // Validate required fields
        if (!email || !password || !firstname || !surname) {
            return NextResponse.json(
                { success: false, message: 'Email, password, firstname and surname are required' },
                { status: 400 }
            );
        }

        // Check if lecturer already exists (by email or staffId)
        const existingLecturer = await prisma.lecturer.findFirst({
            where: {
                OR: [
                    { email },
                    { staffId: staffId || undefined } // only check if staffId provided
                ]
            },
        });

        if (existingLecturer) {
            if (existingLecturer.email === email) {
                return NextResponse.json(
                    { success: false, message: 'Lecturer with this email already exists' },
                    { status: 400 }
                );
            }
            if (staffId && existingLecturer.staffId === staffId) {
                return NextResponse.json(
                    { success: false, message: 'Lecturer with this Staff ID already exists' },
                    { status: 400 }
                );
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create lecturer
        const lecturer = await prisma.lecturer.create({
            data: {
                email,
                firstname,
                surname,
                avatar: avatar || null,
                password: hashedPassword,
                role: 'Lecturer', // Enforce role
                staffId: staffId || null,
                title: title || null,
                department: department || null,
                faculty: faculty || null,
                qualification: qualification || null,
                specialization: specialization || null,
                bio: bio || null,
                employmentType: employmentType || null,
                status: 'ACTIVE'
            },
            select: {
                id: true,
                email: true,
                firstname: true,
                surname: true,
                avatar: true,
                role: true,
                staffId: true,
                createdAt: true,
                updatedAt: true,
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
