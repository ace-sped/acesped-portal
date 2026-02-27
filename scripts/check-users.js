const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('\n=================================');
  console.log('Checking Users in Database');
  console.log('=================================\n');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstname: true,
        surname: true,
        role: true,
        password: true, // We'll check if it's hashed
      },
    });

    if (users.length === 0) {
      console.log('❌ No users found in database!\n');
      console.log('Run "npm run seed-users" to create test users.\n');
    } else {
      console.log(`Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.firstname} ${user.surname}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Password: ${isHashed ? '✅ Hashed (bcrypt)' : '❌ Not hashed (plain text)'}`);
        console.log(`   Password preview: ${user.password.substring(0, 30)}...`);
        console.log('');
      });
    }

    console.log('=================================\n');

  } catch (error) {
    console.error('\n❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();








