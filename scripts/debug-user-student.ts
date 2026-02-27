
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Note: User and Student are separate models in this schema (no direct relation)
        console.log('Fetching users...');
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true },
        });

        console.log(`Found ${users.length} users.`);
        for (const user of users) {
            console.log(`User: ${user.email} [${user.role}]`);
        }

        console.log('\nFetching all students...');
        const students = await prisma.student.findMany({
            select: { id: true, applicationId: true, matricNumber: true },
        });
        console.log(`Found ${students.length} students in total.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
