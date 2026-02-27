
import { prisma } from './lib/prisma';

async function main() {
    console.log('--- ROLES ---');
    const roles = await prisma.role.findMany();
    console.log(JSON.stringify(roles, null, 2));

    console.log('\n--- USERS with Dual Roles ---');
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { role: 'Head_of_Program' },
                { role: 'Lecturer' }
            ]
        },
        select: {
            email: true,
            role: true
        }
    });
    console.log(JSON.stringify(users, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
