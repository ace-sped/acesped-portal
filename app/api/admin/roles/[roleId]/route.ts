import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Update a specific role's permissions
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { displayName, description, permissions } = await request.json();
    const { roleId } = await params;
    if (!roleId) {
      return NextResponse.json(
        { success: false, error: 'Missing roleId' },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { role: roleId }
    });

    if (existingRole) {
      // Update existing role
      const updatedRole = await prisma.role.update({
        where: { role: roleId },
        data: {
          displayName,
          description,
          permissions,
        },
      });

      return NextResponse.json({
        success: true,
        role: updatedRole,
        message: 'Role updated successfully',
      });
    } else {
      // Create new role if it doesn't exist
      const newRole = await prisma.role.create({
        data: {
          role: roleId,
          displayName,
          description,
          permissions,
        },
      });

      return NextResponse.json({
        success: true,
        role: newRole,
        message: 'Role created successfully',
      });
    }
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// GET - Fetch a specific role
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params;
    if (!roleId) {
      return NextResponse.json(
        { success: false, error: 'Missing roleId' },
        { status: 400 }
      );
    }

    const role = await prisma.role.findUnique({
      where: { role: roleId }
    });

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      role: {
        role: role.role,
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions as string[],
      },
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

