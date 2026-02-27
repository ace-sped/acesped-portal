const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createSuperAdmin() {
  console.log('\n=================================');
  console.log('Create Super Admin User');
  console.log('=================================\n');

  try {
    const email = await question('Enter email address: ');
    const firstname = await question('Enter first name: ');
    const surname = await question('Enter surname: ');
    const password = await question('Enter password: ');

    if (!email || !password) {
      console.error('\n❌ Email and password are required!');
      rl.close();
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error('\n❌ User with this email already exists!');
      rl.close();
      process.exit(1);
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstname: firstname || null,
        surname: surname || null,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      }
    });

    console.log('\n✅ Super Admin created successfully!');
    console.log('\n=================================');
    console.log('User Details:');
    console.log('=================================');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', `${user.firstname} ${user.surname}`);
    console.log('Role:', user.role);
    console.log('=================================\n');
    console.log('You can now login at: http://localhost:3000/admin\n');

  } catch (error) {
    console.error('\n❌ Error creating user:', error.message);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

createSuperAdmin();

