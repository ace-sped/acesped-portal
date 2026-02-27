
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@aceportal.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                firstname: 'Super',
                surname: 'Admin'
            },
            create: {
                email,
                password: hashedPassword,
                firstname: 'Super',
                surname: 'Admin',
                role: 'SUPER_ADMIN',
            },
        });

        console.log(`User ${user.email} created/updated with password: ${password}`);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
