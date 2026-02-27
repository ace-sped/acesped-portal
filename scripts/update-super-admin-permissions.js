const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateSuperAdminPermissions() {
  console.log('\n🔧 Updating SUPER_ADMIN permissions...\n');

  try {
    const updatedRole = await prisma.role.update({
      where: { role: 'SUPER_ADMIN' },
      data: {
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
    });

    console.log('✅ Successfully updated SUPER_ADMIN permissions!');
    console.log('\nNew permissions:');
    updatedRole.permissions.forEach((perm, index) => {
      console.log(`  ${index + 1}. ${perm}`);
    });
    console.log('\n✨ Done! The "Access Codes" menu item should now appear in /admin sidebar.\n');
  } catch (error) {
    console.error('❌ Error updating SUPER_ADMIN permissions:', error);
    
    if (error.code === 'P2025') {
      console.log('\n⚠️  SUPER_ADMIN role not found. Please run: node scripts/seed-roles.js\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

updateSuperAdminPermissions();
