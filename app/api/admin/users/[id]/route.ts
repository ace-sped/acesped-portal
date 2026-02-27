import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role

    const body = await request.json();
    const { email, firstname, surname, password, role, avatar, signature } = body;
    const { id } = await params;

    console.log(`PUT /api/admin/users/${id} - Updating user`, {
      hasSignature: !!signature,
      signatureLength: signature?.length,
      role
    });

    // Check if user exists first
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Validate role exists in Role table (if provided and changed)
    if (role && role !== existingUser.role) {
      const existingRole = await prisma.role.findUnique({ where: { role } });
      if (!existingRole) {
        return NextResponse.json(
          { success: false, message: 'Invalid role' },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and if it's already taken
    if (email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { success: false, message: 'Email is already taken' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      email,
      firstname: firstname || null,
      surname: surname || null,
      role,

    };

    // Only update avatar if provided or explicitly null
    if (avatar !== undefined) {
      updateData.avatar = avatar || null;
    }

    // Only update signature if provided or explicitly null
    if (signature !== undefined) {
      updateData.signature = signature || null;
    }

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstname: true,
        surname: true,
        avatar: true,
        role: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for SUPER_ADMIN role

    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}


