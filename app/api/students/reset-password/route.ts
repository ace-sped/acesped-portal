import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { success: false, message: 'Token and password are required' },
                { status: 400 }
            );
        }

        // Verify Token
        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        );

        let payload;
        try {
            const verified = await jwtVerify(token, secret);
            payload = verified.payload;
        } catch (error) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired reset token' },
                { status: 401 }
            );
        }

        if (payload.type !== 'password-reset') {
            return NextResponse.json(
                { success: false, message: 'Invalid token type' },
                { status: 401 }
            );
        }

        const userId = payload.userId as string;

        // Update User Password
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return NextResponse.json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (error: any) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while resetting password.' },
            { status: 500 }
        );
    }
}
