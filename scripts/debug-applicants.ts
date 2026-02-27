
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing prisma.application.findMany...');
        if (!prisma.application) {
            console.error('prisma.application is undefined! Prisma Client might be out of sync.');
            return;
        }

        const where: any = {
            OR: [
                { firstname: { contains: 'a', mode: 'insensitive' } },
            ]
        };

        const applications = await prisma.application.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            take: 5
        });
        console.log('Successfully fetched applications:', applications);
    } catch (error: any) {
        console.error('Error fetching applications details:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        console.error('Meta:', error.meta);
    } finally {
        await prisma.$disconnect();
    }
}

main();
