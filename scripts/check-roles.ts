
import { prisma } from '@/lib/prisma';

async function main() {
    const roles = await prisma.role.findMany();
    console.log('Roles in DB:', roles);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
