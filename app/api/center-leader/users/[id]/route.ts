import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// PUT update user (Center Leaders cannot edit SUPER_ADMIN users or change role to SUPER_ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for Center_Leader role

    const body = await request.json();
    const { email, firstname, surname, password, role, roles, avatar } = body;
    const { id } = await params;

    // Determine primary role and additional roles
    let primaryRole = role;
    if (roles && Array.isArray(roles) && roles.length > 0) {
      primaryRole = roles[0];
    }

    // Validate primary role exists in Role table (if provided)
    if (primaryRole) {
      const existingRole = await prisma.role.findUnique({ where: { role: primaryRole } });
      if (!existingRole) {
        return NextResponse.json(
          { success: false, message: 'Invalid primary role' },
          { status: 400 }
        );
      }
    }

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

    // Center Leaders cannot edit SUPER_ADMIN users
    if (existingUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to edit SUPER_ADMIN users' },
        { status: 403 }
      );
    }

    // Center Leaders cannot change role to SUPER_ADMIN
    // Center Leaders cannot change role to SUPER_ADMIN
    if (primaryRole === 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to assign SUPER_ADMIN role' },
        { status: 403 }
      );
    }

    // Center Leaders cannot edit existing Center_Leader users (prevent privilege escalation)
    if (existingUser.role === 'Center_Leader') {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to edit Center Leader users' },
        { status: 403 }
      );
    }

    // Center Leaders cannot change role to Center_Leader (prevent privilege escalation)
    // Center Leaders cannot change role to Center_Leader (prevent privilege escalation)
    if (primaryRole === 'Center_Leader') {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to assign Center Leader role' },
        { status: 403 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
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
    };

    if (primaryRole) updateData.role = primaryRole;

    // Only update avatar if provided or explicitly null
    if (avatar !== undefined) {
      updateData.avatar = avatar || null;
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

// DELETE user (Center Leaders cannot delete SUPER_ADMIN users)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for Center_Leader role

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

    // Center Leaders cannot delete SUPER_ADMIN users
    if (existingUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to delete SUPER_ADMIN users' },
        { status: 403 }
      );
    }

    // Center Leaders cannot delete other Center_Leader users (prevent privilege escalation)
    if (existingUser.role === 'Center_Leader') {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to delete Center Leader users' },
        { status: 403 }
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

