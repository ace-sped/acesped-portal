import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';
import { Resend } from 'resend';

// Helper to get Resend instance
const getResend = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    return new Resend(apiKey);
};

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email address is required' },
                { status: 400 }
            );
        }

        // Find user with this email (student auth lives on User model with role 'Student')
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // If no user or not a student, we returns success anyway to prevent email enumeration
        // But for this specific "student" portal, we might want to be strict.
        // However, generic security practice suggests generic success.
        // BUT, if user exists but isn't a student, we probably shouldn't send a student reset link?
        // Let's just check if user exists.

        if (!user || user.role !== 'Student') {
            // Fake success delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link shortly.'
            });
        }

        // Generate Reset Token (JWT)
        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        );

        // Token valid for 1 hour
        const token = await new SignJWT({ userId: user.id, type: 'password-reset' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(secret);

        const resetLink = `${request.nextUrl.origin}/students/reset-password?token=${token}`;

        // Send Email
        const resend = getResend();
        if (resend) {
            const from = process.env.EMAIL_FROM || 'ACE-SPED ICT <onboarding@resend.dev>';

            await resend.emails.send({
                from,
                to: email,
                subject: 'Password Reset Request - ACE-SPED Student Portal',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Password Reset Request</h2>
                        <p>Hello ${user.firstname},</p>
                        <p>We received a request to reset your password for the ACE-SPED Student Portal.</p>
                        <p>Click the link below to reset your password. This link acts as a one-time use key and is valid for 1 hour.</p>
                        <p style="margin: 20px 0;">
                            <a href="${resetLink}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                Reset Password
                            </a>
                        </p>
                        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                        <p style="color: #999; font-size: 12px;">ACE-SPED ICT Unit</p>
                    </div>
                `
            });
        } else {
            console.warn('Resend API Key missing, could not send reset email.');
            // In dev, maybe log the link
            if (process.env.NODE_ENV === 'development') {
                console.log('DEV ONLY - Reset Link:', resetLink);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link shortly.'
        });

    } catch (error: any) {
        console.error('Password reset request error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred processing your request.' },
            { status: 500 }
        );
    }
}
