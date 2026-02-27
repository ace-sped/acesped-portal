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

async function resetPassword() {
  console.log('\n=================================');
  console.log('Reset User Password');
  console.log('=================================\n');

  try {
    const email = await question('Enter user email: ');
    const newPassword = await question('Enter new password: ');

    if (!email || !newPassword) {
      console.error('\n❌ Email and password are required!');
      rl.close();
      process.exit(1);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`\n❌ User with email "${email}" not found!`);
      rl.close();
      process.exit(1);
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log('\n✅ Password updated successfully!');
    console.log('\n=================================');
    console.log('Updated User:');
    console.log('=================================');
    console.log('Email:', user.email);
    console.log('Name:', `${user.firstname} ${user.surname}`);
    console.log('Role:', user.role);
    console.log('New Password:', newPassword);
    console.log('=================================\n');
    console.log('You can now login with this email and password.\n');

  } catch (error) {
    console.error('\n❌ Error resetting password:', error.message);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

resetPassword();








