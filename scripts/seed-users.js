const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('\n=================================');
  console.log('Seeding Test Users');
  console.log('=================================\n');

  try {
    // Create Super Admin
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@aceportal.com' },
      update: {},
      create: {
        email: 'admin@aceportal.com',
        firstname: 'Super',
        surname: 'Admin',
        password: adminPassword,
        role: 'SUPER_ADMIN',
      },
    });
    console.log('✅ Super Admin created:', admin.email);

    // Create Center Leader
    const leaderPassword = bcrypt.hashSync('leader123', 10);
    const leader = await prisma.user.upsert({
      where: { email: 'leader@aceportal.com' },
      update: {},
      create: {
        email: 'leader@aceportal.com',
        firstname: 'Center',
        surname: 'Leader',
        password: leaderPassword,
        role: 'Center_Leader',
      },
    });
    console.log('✅ Center Leader created:', leader.email);

    // Create Deputy Center Leader
    const deputyPassword = bcrypt.hashSync('deputy123', 10);
    const deputy = await prisma.user.upsert({
      where: { email: 'deputy@aceportal.com' },
      update: {},
      create: {
        email: 'deputy@aceportal.com',
        firstname: 'Deputy',
        surname: 'Leader',
        password: deputyPassword,
        role: 'Deputy_Center_Leader',
      },
    });
    console.log('✅ Deputy Center Leader created:', deputy.email);

    console.log('\n=================================');
    console.log('Test Users Created Successfully!');
    console.log('=================================');
    console.log('\nLogin Credentials:');
    console.log('----------------------------------');
    console.log('Super Admin:');
    console.log('  Email: admin@aceportal.com');
    console.log('  Password: admin123');
    console.log('  Dashboard: http://localhost:3000/admin');
    console.log('\nCenter Leader:');
    console.log('  Email: leader@aceportal.com');
    console.log('  Password: leader123');
    console.log('  Dashboard: http://localhost:3000/center-leader');
    console.log('\nDeputy Center Leader:');
    console.log('  Email: deputy@aceportal.com');
    console.log('  Password: deputy123');
    console.log('  Dashboard: http://localhost:3000/center-leader');
    console.log('=================================\n');

  } catch (error) {
    console.error('\n❌ Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();








