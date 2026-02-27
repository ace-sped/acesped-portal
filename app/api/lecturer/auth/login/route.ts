import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        const normalizedEmail = typeof email === 'string' ? email.trim() : '';

        if (!normalizedEmail || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find lecturer by email in Lecturer table
        const lecturer = await prisma.lecturer.findFirst({
            where: {
                email: { equals: normalizedEmail, mode: 'insensitive' },
            },
        });

        // Also check if lecturer found (if schema update hasn't propagated, this will fail at runtime, so we need prisma generate)
        // TypeScript might complain here if I don't use 'as any' until regeneration.

        if (!lecturer) {
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const storedPassword = lecturer.password ?? '';
        const isBcryptHash = /^\$2[aby]\$/.test(storedPassword);
        let isPasswordValid = false;
        let shouldRehash = false;

        if (isBcryptHash) {
            isPasswordValid = await bcrypt.compare(password, storedPassword);
        } else {
            isPasswordValid = storedPassword === password;
            shouldRehash = isPasswordValid;
        }

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        if (shouldRehash) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.lecturer.update({
                where: { id: lecturer.id },
                data: { password: hashedPassword },
            });
        }

        // Create JWT token specifically for Lecturer
        // We might want to use a distinct role or flag in the token to indicate it's from the Lecturer table
        const token = await new SignJWT({
            userId: lecturer.id,
            email: lecturer.email,
            role: 'Lecturer',
            isLecturerTable: true // Flag to distinguish if needed
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(JWT_SECRET);

        const { password: _, ...lecturerWithoutPassword } = lecturer;

        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            user: { ...lecturerWithoutPassword, role: 'Lecturer' },
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Lecturer Login error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred during login' },
            { status: 500 }
        );
    }
}
