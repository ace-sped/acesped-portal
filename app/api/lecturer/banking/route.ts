
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const user = await prisma.lecturer.findUnique({
            where: { id: userId },
            select: {
                bankName: true,
                accountNumber: true,
                accountName: true
            }
        });

        return NextResponse.json({
            success: true,
            banking: user
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch banking details' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const body = await request.json();
        const { bankName, accountNumber, accountName } = body;

        await prisma.lecturer.update({
            where: { id: userId },
            data: {
                bankName,
                accountNumber,
                accountName
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Banking details updated successfully'
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to update banking details' }, { status: 500 });
    }
}
