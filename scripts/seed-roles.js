const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEFAULT_ROLES = [
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
      'Manage Projects',
      'Manage News',
      'Manage Team',
      'Role Management',
      'Access Codes',
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
    role: 'Co_Head_of_Program',
    displayName: 'Co-Head of Program',
    description:
      'Assists the head of program in leading academic programs and managing program-level operations.',
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
    role: 'ICT',
    displayName: 'ICT Officer',
    description: 'Manages information and communication technology systems and infrastructure.',
    permissions: ['Dashboard', 'Profile', 'Reports', 'System Settings'],
  },
  {
    role: 'Monitoring_and_Evaluation_Officer',
    displayName: 'Monitoring and Evaluation Officer',
    description: 'Monitors and evaluates programs, projects, and institutional performance.',
    permissions: ['Dashboard', 'Profile', 'Reports', 'Activity Logs'],
  },
  {
    role: 'Head_of_Innovation',
    displayName: 'Head of Innovation',
    description: 'Leads innovation initiatives and manages research projects.',
    permissions: [
      'Dashboard',
      'Profile',
      'Manage Projects',
      'Access Codes',
      'Reports',
    ],
  },
];

async function seedRoles() {
  console.log('\n=================================');
  console.log('Seeding Roles');
  console.log('=================================\n');

  try {
    let createdCount = 0;
    let updatedCount = 0;

    for (const roleData of DEFAULT_ROLES) {
      const existingRole = await prisma.role.findUnique({
        where: { role: roleData.role },
      });

      if (existingRole) {
        await prisma.role.update({
          where: { role: roleData.role },
          data: {
            displayName: roleData.displayName,
            description: roleData.description,
            permissions: roleData.permissions,
          },
        });
        console.log(`✅ Updated role: ${roleData.displayName} (${roleData.role})`);
        updatedCount++;
      } else {
        await prisma.role.create({
          data: roleData,
        });
        console.log(`✅ Created role: ${roleData.displayName} (${roleData.role})`);
        createdCount++;
      }
    }

    console.log('\n=================================');
    console.log('Roles Seeded Successfully!');
    console.log('=================================');
    console.log(`Created: ${createdCount} roles`);
    console.log(`Updated: ${updatedCount} roles`);
    console.log(`Total: ${DEFAULT_ROLES.length} roles\n`);
  } catch (error) {
    console.error('\n❌ Error seeding roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedRoles();
