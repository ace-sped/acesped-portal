import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_ROLES: Array<{
  role: string;
  displayName: string;
  description: string;
  permissions: string[];
}> = [
    {
      role: 'SUPER_ADMIN',
      displayName: 'Super Administrator',
      description:
        'Has complete control over the entire portal with unrestricted access to all features and settings.',
      permissions: [
        'Dashboard',
        'Profile',
        'User Management',
        'Manage Applicants',
        'Skill Applicants',
        'Manage Services',
        'Manage Programs',
        'Manage News',
        'Manage Team',
        'Role Management',
        'Activity Logs',
        'System Settings',
        'Reports',
        'Share Docs',
        'Database',
      ],
    },
    {
      role: 'Center_Leader',
      displayName: 'Center Leader',
      description:
        'Oversees center operations and manages staff within their department.',
      permissions: [
        'Dashboard',
        'Profile',
        'User Management',
        'Manage Programs',
        'Manage Team',
        'Reports',
      ],
    },
    {
      role: 'Center_Secretary',
      displayName: 'Center Secretary',
      description: 'Provides administrative support and coordinates center activities.',
      permissions: ['Dashboard', 'Profile', 'Reports'],
    },
    {
      role: 'Deputy_Center_Leader',
      displayName: 'Deputy Center Leader',
      description:
        'Assists the center leader in managing operations and programs.',
      permissions: ['Dashboard', 'Profile', 'Manage Programs', 'Reports'],
    },
    {
      role: 'Academic_Program_Coordinator',
      displayName: 'Academic Program Coordinator',
      description: 'Coordinates academic programs and manages course offerings.',
      permissions: [
        'Dashboard',
        'Profile',
        'Manage Programs',
        'Manage Applicants',
        'Reports',
      ],
    },
    {
      role: 'Applied_Research_Coordinator',
      displayName: 'Applied Research Coordinator',
      description:
        'Aligns applied research initiatives with institutional goals and partnerships.',
      permissions: ['Dashboard', 'Profile', 'Reports', 'Share Docs'],
    },
    {
      role: 'Head_of_Program',
      displayName: 'Head of Program',
      description:
        'Leads specific academic programs and manages program-level operations.',
      permissions: ['Dashboard', 'Profile', 'Manage Programs', 'Manage Applicants'],
    },
    {
      role: 'Lecturer',
      displayName: 'Lecturer',
      description: 'Teaches courses and manages student assessments.',
      permissions: ['Dashboard', 'Profile'],
    },
    {
      role: 'Student',
      displayName: 'Student',
      description: 'Enrolled student with access to learning materials and courses.',
      permissions: ['Dashboard', 'Profile'],
    },
    {
      role: 'Applicant',
      displayName: 'Applicant',
      description: 'Prospective student applying for admission.',
      permissions: ['Dashboard', 'Profile'],
    },
    {
      role: 'PG_Rep',
      displayName: 'PG Representative',
      description: 'Represents postgraduate students and supports academic engagement.',
      permissions: ['Dashboard', 'Profile'],
    },
    {
      role: 'Staff',
      displayName: 'Staff',
      description: 'Administrative and support staff member.',
      permissions: ['Dashboard', 'Profile'],
    },
    {
      role: 'Head_of_Finance',
      displayName: 'Head of Finance',
      description: 'Manages financial operations and budgets.',
      permissions: ['Dashboard', 'Profile', 'Reports'],
    },
    {
      role: 'Industrial_Liaison_Officer',
      displayName: 'Industrial Liaison Officer',
      description: 'Manages industry partnerships and internship programs.',
      permissions: ['Dashboard', 'Profile', 'Reports', 'Share Docs'],
    },
    {
      role: 'Head_of_Innovation',
      displayName: 'Head of Innovation',
      description: 'Oversees innovation strategies, research commercialization, and patenting processes.',
      permissions: ['Dashboard', 'Manage Projects', 'Profile', 'Reports', 'Share Docs'],
    },
  ];

// GET - Fetch all roles with their permissions
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Always return a complete set of default roles, while preserving any
    // DB-customized roles and including any extra custom roles stored in DB.
    const existingByRole = new Map(roles.map(r => [r.role, r]));

    const mergedDefaultRoles = DEFAULT_ROLES.map((def) => {
      const existing = existingByRole.get(def.role);
      if (existing) {
        existingByRole.delete(def.role);
        return {
          role: existing.role,
          displayName: existing.displayName,
          description: existing.description,
          permissions: existing.permissions as string[],
          userCount: 0, // populated separately
        };
      }
      return { ...def, userCount: 0 };
    });

    const extraCustomRoles = Array.from(existingByRole.values()).map((role) => ({
      role: role.role,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions as string[],
      userCount: 0, // populated separately
    }));

    return NextResponse.json({
      success: true,
      roles: [...mergedDefaultRoles, ...extraCustomRoles],
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    // Fallback to default roles if database fails
    const fallbackRoles = DEFAULT_ROLES.map(role => ({
      ...role,
      userCount: 0
    }));

    return NextResponse.json({
      success: true,
      roles: fallbackRoles,
      message: 'Loaded default roles (Database offline)'
    });
  }
}

// POST - Create a new role OR Initialize default roles
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    // If body contains role data, create a single role
    if (body && body.displayName) {
      const { displayName, description, permissions } = body;

      // Auto-generate role slug (e.g., "Center Manager" -> "CENTER_MANAGER")
      const roleSlug = displayName
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

      // Check if role already exists
      const existing = await prisma.role.findUnique({
        where: { role: roleSlug }
      });

      if (existing) {
        return NextResponse.json(
          { success: false, message: 'A role with this name already exists' },
          { status: 400 }
        );
      }

      const newRole = await prisma.role.create({
        data: {
          role: roleSlug,
          displayName,
          description: description || '',
          permissions: permissions || [],
        },
      });

      return NextResponse.json({
        success: true,
        role: newRole,
        message: 'Role created successfully'
      });
    }

    // Otherwise, run initialization logic for default roles
    for (const roleData of DEFAULT_ROLES) {
      await prisma.role.upsert({
        where: { role: roleData.role },
        update: {
          displayName: roleData.displayName,
          description: roleData.description,
          permissions: roleData.permissions,
        },
        create: roleData,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Default roles initialized successfully',
    });
  } catch (error) {
    console.error('Error in roles API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

